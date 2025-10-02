import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";

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
  // Storage keys
  const CART_KEY = "cart";
  const LOGGED_USER_KEY = "loggedUser";

  // Helpers
  const safeParseJSON = <T,>(value: string | null, fallback: T): T => {
    try {
      const parsed = value ? JSON.parse(value) : null;
      return (parsed as T) ?? fallback;
    } catch {
      return fallback;
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const storedCart = safeParseJSON<CartItem[] | null>(localStorage.getItem(CART_KEY), null);
    return Array.isArray(storedCart) ? storedCart : [];
  });
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const getLoggedUser = () => safeParseJSON<any>(localStorage.getItem(LOGGED_USER_KEY), null);

  // Cargar métodos de pago del usuario logueado
  useEffect(() => {
    const user = getLoggedUser();
    if (user && user.username) {
      const key = `paymentMethods_${user.username}`;
      const stored = localStorage.getItem(key);
      setPaymentMethods(stored ? JSON.parse(stored) : []);
    } else {
      setPaymentMethods([]);
    }
  }, []);

  const total = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
    [cartItems]
  );

  const handleRemoveItem = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    saveCart(updatedCart);
    toast.success("Item removed from cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Confirm Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-sm rounded-lg p-4 flex justify-between items-center border border-gray-200"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                </div>
                <span className="text-indigo-600 font-semibold">{formatCurrency(item.price)}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  type="button"
                  className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <ul className="divide-y divide-gray-200 mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm text-gray-700">
                <span>{item.title}</span>
                <span className="text-gray-900">{formatCurrency(item.price)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-semibold text-gray-900 text-base mb-6">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>

          {/* Saved payment methods */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Form</label>
            {paymentMethods.length === 0 ? (
              <div className="text-gray-500 text-sm mb-2">You don't have any saved payment methods</div>
            ) : (
              <select className="w-full border rounded-xl p-3 mb-2">
                {paymentMethods.map((pm, idx) => (
                  <option key={idx} value={pm.cardNumber}>
                    {pm.cardType.toUpperCase()} •••• {pm.cardNumber.slice(-4)} - {pm.cardHolder} (exp: {pm.expiryDate})
                  </option>
                ))}
              </select>
            )}
            <button
              className="text-indigo-600 hover:underline text-sm"
              type="button"
              onClick={() => navigate({ to: "/PaymentForm" })}
            >
              Add new payment method
            </button>
          </div>

          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition cursor-pointer"
            onClick={async () => {
              const loggedUser = getLoggedUser();
              if (!loggedUser || !loggedUser.username) {
                localStorage.setItem("pendingCart", JSON.stringify(cartItems));
                navigate({
                  to: "/Login",
                  search: { redirect: "/PaymentForm" },
                });
              } else {
                try {
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

                  const ct = response.headers.get("content-type") || "";
                  const data = ct.includes("application/json")
                    ? await response.json()
                    : await response.text().catch(() => undefined);
                  console.log("Purchase created:", data);

                   // Clear cart
  localStorage.removeItem("cart");

 
  setModalTitle("Purchase Successful");
  setModalMessage(
    "Your purchase was completed successfully. A confirmation email has been sent to you "
  );
  setModalOpen(true);


  setTimeout(() => {
    navigate({ to: "/Profile" });
  }, 7000);
} catch (error) {
  console.error(error);

  setModalTitle("Error");
  setModalMessage(
    error instanceof Error
      ? error.message
      : "The purchase could not be completed"
  );
  setModalOpen(true);
}
              }
            }}
            type="button"
            disabled={cartItems.length === 0}
          >
            Confirm Purchase
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
