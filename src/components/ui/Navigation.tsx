import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState(); // 👈 detecta cambios de ruta
  const [loggedUser, setLoggedUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    setLoggedUser(user ? JSON.parse(user) : null);
  }, [routerState.location.pathname]); 
  // 👆 se vuelve a leer localStorage cada vez que cambias de página

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setLoggedUser(null); // limpiar estado inmediatamente
    navigate({ to: "/" });
  };

  return (
    <nav className="flex gap-4 items-center bg-gray-900 px-4 py-3 rounded-md shadow">
      <Link to="/" className="text-lime-400 hover:underline">
        Landing Page
      </Link>

      {loggedUser && (
        <>
          {loggedUser.role === "admin" && (
            <Link to="/adminUsers" className="text-lime-400 hover:underline">
              Admin Users
            </Link>
          )}

          <Link to="/HomePage" className="text-lime-400 hover:underline">
            Home
          </Link>

          <Link to="/Profile" className="text-lime-400 hover:underline">
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="text-red-400 font-medium hover:underline"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
