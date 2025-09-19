
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
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

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const getLoggedUser = () => safeParseJSON<any>(localStorage.getItem(LOGGED_USER_KEY), null);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Confirm Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">El carrito está vacío.</p>
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
                  Eliminar
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

          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition cursor-pointer"
            onClick={() => {
              const loggedUser = getLoggedUser();
              if (!loggedUser || !loggedUser.username) {
                // Guardar el carrito actual en localStorage antes de redirigir
                localStorage.setItem('pendingCart', JSON.stringify(cartItems));
                // Redirigir al login con la ruta de retorno
                navigate({ 
                  to: "/Login", 
                  search: { redirect: "/PaymentForm" } 
                });
              } else {
                navigate({ to: "/PaymentForm" });
              }
            }}
            type="button"
            disabled={cartItems.length === 0}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
