import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import CustomModal from "../CustomModal";
import {
  getCart,
  saveCart as saveCartStorage,
  getLoggedUser as getLoggedUserStorage,
  CART_KEY,
} from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import { createCheckout } from "../../../utils/stripe";
import { useTranslation } from "react-i18next";

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

type PaymentMethod = {
  cardType: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
};

export default function CartPage() {
  const { t } = useTranslation();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCart = getCart<CartItem[]>();
    return Array.isArray(storedCart) ? storedCart : [];
  });
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isStripeRedirecting, setIsStripeRedirecting] = useState(false);

  // 👇 estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    saveCartStorage(items);
  };

  // Cargar métodos de pago del usuario logueado
  useEffect(() => {
    const user = getLoggedUserStorage();
    if (user && user.username) {
      const key = `paymentMethods_${user.username}`;
      const stored = localStorage.getItem(key);
      setPaymentMethods(stored ? JSON.parse(stored) : []);
    } else {
      setPaymentMethods([]);
    }
  }, []);

  // Migrar títulos existentes del carrito a event_type
  useEffect(() => {
    const migrateTitles = async () => {
      if (!cartItems.length) return;
      try {
        const res = await fetch("https://localhost:7044/Leads/List");
        const leads: Array<{ id: number; event_type: string }> = await res.json();
        const byId = new Map(leads.map((l) => [l.id, l.event_type]));
        let changed = false;
        const next = cartItems.map((ci) => {
          const et = byId.get(ci.id);
          if (et && ci.title !== et) {
            changed = true;
            return { ...ci, title: et };
          }
          return ci;
        });
        if (changed) {
          saveCart(next);
        }
      } catch {
        // ignore migration failures
      }
    };
    migrateTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
    [cartItems]
  );

  const handleRemoveItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    saveCart(updatedCart);

  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8" data-i18n="cart.confirmPurchase">{t("cart.confirmPurchase")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500" data-i18n="cart.empty">{t("cart.empty")}</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white shadow-sm rounded-lg p-4 flex justify-between items-center border border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                </div>
                <span className="text-indigo-600 font-semibold">{formatCurrency(item.price)}</span>
                <button onClick={() => handleRemoveItem(item.id)} type="button" className="text-red-600 hover:text-red-800 font-semibold cursor-pointer" data-i18n="cart.delete">
                  {t("cart.delete")}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4" data-i18n="cart.orderSummary">{t("cart.orderSummary")}</h2>

          <ul className="divide-y divide-gray-200 mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm text-gray-700">
                <span>{item.title}</span>
                <span className="text-gray-900">{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-semibold text-gray-900 text-base mb-6">
            <span data-i18n="cart.total">{t("cart.total")}</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" data-i18n="cart.noSavedPayments">{t("cart.noSavedPayments")}</label>
            {paymentMethods.length === 0 ? (
              <div className="text-gray-500 text-sm mb-2">{t("cart.noSavedPayments")}</div>
            ) : (
              <select className="w-full border rounded-xl p-3 mb-2">
                {paymentMethods.map((pm, idx) => (
                  <option key={idx} value={pm.cardNumber}>
                    {pm.cardType.toUpperCase()} •••• {pm.cardNumber.slice(-4)} - {pm.cardHolder} (exp: {pm.expiryDate})
                  </option>
                ))}
              </select>
            )}
            <button className="text-indigo-600 hover:underline text-sm" type="button" onClick={() => navigate({ to: "/PaymentForm" })} data-i18n="cart.addPaymentMethod">
              {t("cart.addPaymentMethod")}
            </button>
          </div>

          <button className={`w-full bg-indigo-600 text-white py-3 rounded-md font-medium transition cursor-pointer ${isPurchasing ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-700"}`} onClick={async () => {
              if (isPurchasing) return; // guard against double clicks
              const loggedUser = getLoggedUserStorage();
              if (!loggedUser || !loggedUser.username) {
                // No bloquear el botón si redirigimos a login
                localStorage.setItem("pendingCart", JSON.stringify(cartItems));
                navigate({
                  to: "/Login",
                  search: { redirect: "/PaymentForm" },
                });
                return;
              }
              try {
                setIsPurchasing(true);
                const leadIds = cartItems.map((item) => item.id);
                const query = leadIds.map((id) => `leadIds=${id}`).join("&");

                const userId = (loggedUser as any)?.id ?? (loggedUser as any)?.ID ?? 0;
                const purchase = {
                  user_id: userId,
                  amount: total,
                };

                const token = localStorage.getItem("authToken");
                const response = await fetch(`https://localhost:7044/Purchase/Create?${query}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(purchase),
                });

                if (!response.ok) {
                  const errorText = await response.text().catch(() => "");
                  throw new Error(errorText || `Error creating purchase (${response.status})`);
                }

                // Clear cart
                localStorage.removeItem(CART_KEY);

                setModalTitle(t("cart.purchaseSuccessTitle"));
                setModalMessage(t("cart.purchaseSuccessMessage"));

                setModalOpen(true);

                // Mantener el botón deshabilitado tras éxito para evitar duplicados
                setTimeout(() => {
                  navigate({ to: "/Profile" });
                }, 7000);
              } catch (error) {
                console.error(error);
                setIsPurchasing(false); // Rehabilitar para reintentar si falló

                setModalTitle(t("cart.purchaseErrorTitle"));
                setModalMessage(
                  error instanceof Error
                    ? error.message
                    : t("cart.purchaseErrorMessage")
                );
                setModalOpen(true);
              }
            }}
            type="button"
            disabled={cartItems.length === 0 || isPurchasing}
            data-i18n="cart.confirmPurchaseBtn"
          >
            {isPurchasing ? t("cart.processing") : t("cart.confirmPurchaseBtn")}
          </button>

          <div className="my-3 text-center text-gray-400 text-sm" data-i18n="cart.or">{t("cart.or")}</div>

          <button className={`w-full bg-black text-white py-3 rounded-md font-medium transition cursor-pointer ${isStripeRedirecting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-900"}`} onClick={async () => {
              if (isStripeRedirecting) return;
              const loggedUser = getLoggedUserStorage();
              if (!loggedUser || !loggedUser.username) {
                localStorage.setItem("pendingCart", JSON.stringify(cartItems));
                navigate({ to: "/Login", search: { redirect: "/Cart" } });
                return;
              }
              try {
                setIsStripeRedirecting(true);
                // Map your cart items to Stripe Price IDs.
                // Replace this logic with real mapping from your backend or SKU table.
                const PRICE_VERIFIED = import.meta.env.VITE_PRICE_VERIFIED || "price_123";
                const PRICE_INCOMPLETE = import.meta.env.VITE_PRICE_INCOMPLETE || "price_456";

                // Guard against placeholder IDs to avoid 500s from backend
                const usingPlaceholders =
                  !PRICE_VERIFIED || PRICE_VERIFIED === "price_123" ||
                  !PRICE_INCOMPLETE || PRICE_INCOMPLETE === "price_456";
                if (usingPlaceholders) {
                  setModalTitle(t("cart.stripeSetupTitle"));
                  setModalMessage(t("cart.stripeSetupMessage"));
                  setModalOpen(true);
                  setIsStripeRedirecting(false);
                  return;
                }
                const items = cartItems.map((ci) => ({
                  priceId: ci.price >= 200 ? PRICE_VERIFIED : PRICE_INCOMPLETE,
                  quantity: ci.quantity || 1,
                }));
                await createCheckout({
                  items,
                  customerEmail: (loggedUser as any)?.email,
                  // Optional identifiers
                  clientReferenceId: `user-${(loggedUser as any)?.id || (loggedUser as any)?.ID || "unknown"}`,
                  // You can omit successUrl/cancelUrl to use backend defaults
                });
              } catch (e) {
                console.error(e);
                setModalTitle(t("cart.stripeErrorTitle"));
                setModalMessage(e instanceof Error ? e.message : t("cart.stripeErrorMessage"));
                setModalOpen(true);
              } finally {
                setIsStripeRedirecting(false);
              }
            }}
            type="button"
            disabled={cartItems.length === 0 || isStripeRedirecting}
            data-i18n="cart.payWithStripe"
          >
            {isStripeRedirecting ? t("cart.redirectStripe") : t("cart.payWithStripe")}
          </button>
        </div>
      </div>

      {/* Modal global */}
      <CustomModal
        isOpen={modalOpen}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
