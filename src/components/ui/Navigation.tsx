import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  clearLoggedUser,
  getLoggedUser,
  type LoggedUser,
} from "../../utils/storage";

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [loggedUser, setLoggedUserState] = useState<LoggedUser>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setLoggedUserState(getLoggedUser());
  }, [routerState.location.pathname]);

  // Detect touch devices to provide click fallback
  useEffect(() => {
    const hasTouch =
      ("ontouchstart" in window) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      ((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    setIsTouch(!!hasTouch);
  }, []);

  const handleLogout = () => {
    clearLoggedUser();
    setLoggedUserState(null);
    navigate({ to: "/" });
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  return (
    <nav className="relative z-40 flex items-center justify-between bg-gray-900/95 backdrop-blur-md px-6 py-3 shadow-md">
      {/* Izquierda: Logo empresa */}
      <img
        src="/logo apollo.png"
        alt=""
        aria-hidden="true"
        role="presentation"
        className="h-4 md:h-6 lg:h-8 w-auto opacity-90"
      />

      {/* Centro: Logo Disaster Match */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link
          to="/"
          className="flex items-center"
          aria-label="Go to Landing Page"
        >
          <img
            src="/Logo DM.png"
            alt="Disaster Match logo"
            className="h-12 md:h-16 lg:h-20 w-auto drop-shadow-sm hover:opacity-90 transition-opacity"
          />
        </Link>
      </div>

      {/* Derecha: Auth-aware actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {(() => {
          const path = routerState.location.pathname.toLowerCase();
          const isLanding = path === "/" || path === "/landingpage";

          if (loggedUser) {
            return (
              <>
                {loggedUser.role === "admin" && (
                  <Link
                    to="/AdminReports"
                    className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/HomePage"
                  className="text-gray-300 hover:text-lime-400 transition-colors duration-200"
                >
                  DisasterMatch
                </Link>

                {/* Profile dropdown */}
                <div
                  className="relative"
                  ref={profileRef}
                  onMouseEnter={!isTouch ? () => setIsProfileOpen(true) : undefined}
                  onMouseLeave={!isTouch ? () => setIsProfileOpen(false) : undefined}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isProfileOpen}
                    onClick={isTouch ? () => setIsProfileOpen((v) => !v) : undefined}
                    className="focus:outline-none"
                  >
                    <img
                      src="/avatars/default1.png"
                      alt="Open profile menu"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:opacity-90 transition"
                    />
                  </button>
                  {isProfileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-sm p-2 z-50"
                    >
                      <Link
                        to="/Profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          }

          // Not logged in
          return isLanding ? (
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                to="/Login"
                className="px-4 py-2 text-sm md:text-base border border-indigo-500 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/Register"
                className="px-4 py-2 text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          ) : null;
        })()}
      </div>
    </nav>
  );
}
