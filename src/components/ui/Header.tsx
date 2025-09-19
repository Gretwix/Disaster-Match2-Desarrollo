import { useEffect, useRef, useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import { formatCurrency } from "../../utils/format";

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
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  

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
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-end">
          {/* Carrito */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={cartRef}>
              <button
                className="relative flex items-center justify-center bg-indigo-400 rounded-full p-2 hover:bg-indigo-700 transition"
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
                                {formatCurrency(item.price)}
                                {item.quantity > 1 ? `  •  x${item.quantity}` : null}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-semibold text-indigo-600">
                          {formatCurrency(total)}
                        </span>
                      </div>

                      <button
                        className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                        onClick={() => {
                          alert(`✅ Purchase confirmed for ${formatCurrency(total)}`);
                          setIsCartOpen(false);
                          navigate({ to: "/Cart" });
                        }}
                        type="button"
                      >
                        Go to Cart
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

           
          </div>
        </div>
      </div>
    </header>
  );
}
