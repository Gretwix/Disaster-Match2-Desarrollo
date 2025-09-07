import { useEffect, useRef, useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import LogoutButton from "./LogoutButton";

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface HeaderProps {
  cartCount: number;
  cartItems: CartItem[];
  total: number;
}

export default function Header({ cartCount, cartItems, total }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 👇 revisa si el usuario está logueado
  const isLoggedIn = !!localStorage.getItem("authToken");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!cartRef.current) return;
      if (!cartRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    }

    if (isCartOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartOpen]);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo + Nombre */}
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="ml-2 text-xl font-semibold text-gray-800">
              911 Incident Reports
            </h1>
          </div>

          {/* Carrito + Auth */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <div className="relative" ref={cartRef}>
              <button
                className="relative p-2 text-gray-600 hover:text-indigo-600"
                onClick={() => setIsCartOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isCartOpen}
                aria-label="Open cart"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {isCartOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-sm p-4 z-20"
                  role="menu"
                >
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center">Your cart is empty</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {cartItems.map((item) => (
                          <li
                            key={item.id}
                            className="py-2 flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${item.price}
                                {item.quantity > 1 ? `  •  x${item.quantity}` : null}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-semibold text-indigo-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>

                      <button
                        className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                        onClick={() => {
                          alert(`✅ Purchase confirmed for $${total.toFixed(2)}`);
                          setIsCartOpen(false);
                        }}
                      >
                        Confirm Purchase
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 👇 Auth: Sign In / Logout */}
            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <button
                onClick={() => navigate({ to: "/Login" })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
