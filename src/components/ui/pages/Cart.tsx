
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    setCartItems(stored ? JSON.parse(stored) : []);
  }, []);

  const total = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleRemoveItem = (id: number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Confirm Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de incidentes */}
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
                <span className="text-indigo-600 font-semibold">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resumen de compra */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <ul className="divide-y divide-gray-200 mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm text-gray-700">
                <span>{item.title}</span>
                <span className="text-gray-900">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-semibold text-gray-900 text-base mb-6">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>

          <button
            className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition cursor-pointer"
            onClick={() => {
              const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");
              if (!loggedUser || !loggedUser.username) {
                navigate({ to: "/Login" });
              } else {
                navigate({ to: "/PaymentForm" });
              }
            }}
            disabled={cartItems.length === 0}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
