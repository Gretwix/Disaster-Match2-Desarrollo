import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [loggedUser, setLoggedUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    setLoggedUser(user ? JSON.parse(user) : null);
  }, [routerState.location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setLoggedUser(null);
    navigate({ to: "/" });
  };

  return (
    <nav className="flex items-center justify-between bg-gray-900/95 backdrop-blur-md px-6 py-3 shadow-md">
      {/* Logo / Marca */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-white">911 Incident Reports</span>
      </div>

      {/* Links centrales */}
      <div className="flex gap-6">
        <Link
          to="/"
          className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
        >
          Landing Page
        </Link>

        {loggedUser && (
          <>
            {loggedUser.role === "admin" && (
              <Link
                to="/AdminUsers"
                className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
              >
                Admin Users
              </Link>
            )}

            <Link
              to="/HomePage"
              className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
            >
              Home
            </Link>

            <Link
              to="/Profile"
              className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
            >
              Profile
            </Link>
          </>
        )}
      </div>

      {/* Logout a la derecha */}
      {loggedUser && (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
