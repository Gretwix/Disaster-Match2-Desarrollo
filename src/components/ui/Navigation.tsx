import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
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
  const closeTimerRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

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

  // Read initial theme
  useEffect(() => {
    try {
      setIsDark(document.documentElement.classList.contains("dark"));
    } catch {}
  }, []);

  const toggleTheme = () => {
    try {
      // Always read the actual DOM state to avoid stale local state
      const currentlyDark = document.documentElement.classList.contains("dark");
      const next = !currentlyDark;
      const root = document.documentElement;
      const body = document.body;
      if (next) {
        root.classList.add("dark");
        body.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        try {
          // Clean up any stray 'dark' class on descendants to prevent scoping from lingering
          document.querySelectorAll<HTMLElement>(".dark").forEach((el) => {
            if (el !== root && el !== body) el.classList.remove("dark");
          });
        } catch {}
      }
      setIsDark(next);
    } catch {}
  };

  const handleLogout = () => {
    // Send logout to server with raw token in Authorization header
    const doLogout = async () => {
      try {
        const token = (getLoggedUser() as any)?.token || localStorage.getItem("authToken");
        if (token) {
          const doRequest = async (url: string) => fetch(url, {
            method: "POST",
            headers: {
              // Raw GUID token with no Bearer prefix per backend requirement
              Authorization: token,
            },
          });
          try {
            await doRequest("https://localhost:7044/Users/Logout");
          } catch {
            // try HTTP fallback
            try { await doRequest("http://localhost:7044/Users/Logout"); } catch {}
          }
        }
      } catch (err) {
        // Ignore network errors on logout
        console.warn("Logout request failed", err);
      } finally {
        clearLoggedUser();
        localStorage.removeItem("authToken");
        setLoggedUserState(null);
        navigate({ to: "/" });
      }
    };
    void doLogout();
  };

  // Hover intent helpers for stable open/close
  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openProfile = () => {
    clearCloseTimer();
    setIsProfileOpen(true);
  };

  const closeProfileWithDelay = (delay = 180) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsProfileOpen(false);
      closeTimerRef.current = null;
    }, delay);
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

  // Cleanup timer on unmount
  useEffect(() => () => clearCloseTimer(), []);

  return (
    <nav className="relative z-40 flex items-center justify-between bg-white/90 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur-md px-6 py-3 shadow-md">
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

      {/* Derecha: Tema + Auth-aware actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-700/60 bg-black/30 text-gray-200 hover:bg-black/50 transition-colors"
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {(() => {
          const path = routerState.location.pathname.toLowerCase();
          const isLanding = path === "/" || path === "/landingpage";

          if (loggedUser) {
            return (
              <>
                {loggedUser.role === "admin" && (
                  <Link
                    to="/AdminReports"
                    className="text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200"
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/HomePage"
                  className="text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200"
                >
                  DisasterMatch
                </Link>

                {/* Profile dropdown */}
                <div
                  className="relative pb-2" // pad bottom to avoid hover gap between button and menu
                  ref={profileRef}
                  onMouseEnter={!isTouch ? openProfile : undefined}
                  onMouseLeave={!isTouch ? () => closeProfileWithDelay() : undefined}
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
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-2 z-50"
                      onMouseEnter={!isTouch ? openProfile : undefined}
                      onMouseLeave={!isTouch ? () => closeProfileWithDelay() : undefined}
                    >
                      <Link
                        to="/Profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800/60"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-500 hover:text-white dark:hover:bg-red-600/30 dark:hover:text-red-200"
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
                className="px-4 py-2 text-sm md:text-base border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors duration-200"
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
