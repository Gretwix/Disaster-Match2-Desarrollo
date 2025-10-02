
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { clearLoggedUser, getLoggedUser, type LoggedUser } from "../../utils/storage";

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [loggedUser, setLoggedUserState] = useState<LoggedUser>(null);

  useEffect(() => {
    setLoggedUserState(getLoggedUser());
  }, [routerState.location.pathname]);

  const handleLogout = () => {
    clearLoggedUser();
    setLoggedUserState(null);
    navigate({ to: "/" });
  };

  return (
    <nav className="relative flex items-center justify-between bg-gray-900/95 backdrop-blur-md px-6 py-3 shadow-md">
      {/* Izquierda: Logo empresa */}
      <img
        src="/logo apollo.png"
        alt=""
        aria-hidden="true"
        role="presentation"
        className="h-4 md:h-6 lg:h-8 w-auto opacity-90"
      />

      {/* Centro: Logo Disaster Match (botón) - centrado */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link 
          to={loggedUser ? "/HomePage" : "/"} 
          className="flex items-center" 
          aria-label={loggedUser ? "Go to Home Page" : "Go to Landing Page"}
        >
          <img
            src="/Logo DM.png"
            alt="Disaster Match logo"
            className="h-12 md:h-16 lg:h-20 w-auto drop-shadow-sm hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      {/* Derecha: Links + Logout */}
      <div className="flex items-center gap-6">
        {loggedUser && (
          <>
            {loggedUser.role === "admin" && (
              <Link
                to="/AdminUsers"
                className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
              >
                AdminUsers
              </Link>
            )}

            <Link
              to="/HomePage"
              className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
            >
              DisasterMatch
            </Link>

            <Link
              to="/Profile"
              className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
            >
              <img
                src={"https://localhost:7044/"+loggedUser?.avatarUrl || "/avatars/default1.png"}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
              />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
