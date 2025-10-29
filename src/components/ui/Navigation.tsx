import { useTranslation } from "react-i18next";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import {
  clearLoggedUser,
  getLoggedUser,
  type LoggedUser,
} from "../../utils/storage";
import apiUrl from "../../utils/api";

export default function Navigation() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [loggedUser, setLoggedUserState] = useState<LoggedUser>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

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
            await doRequest(apiUrl("/Users/Logout"));
          } catch {}
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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [routerState.location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!mobileMenuRef.current) return;
      if (!mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    }
    if (isMobileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  return (
  <nav className="sticky top-0 inset-x-0 z-40 flex items-center justify-between bg-white/90 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 border-b border-gray-200/60 dark:border-gray-800/60 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 shadow-md">
      {/* Left: Brand or mobile menu */}
      <div className="flex items-center gap-2">
        {/* Mobile: Hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-slate-800/60 text-gray-700 dark:text-gray-200 sm:hidden"
          aria-label={isMobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileOpen((v) => !v)}
        >
          <span className="sr-only">{isMobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}</span>
          {/* simple hamburger icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            {isMobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>

        {/* Brand mark (hide on very small if needed) */}
        <img
          src="/logo apollo.png"
          alt=""
          aria-hidden="true"
          role="presentation"
          className="h-4 md:h-6 lg:h-8 w-auto opacity-90 hidden sm:block"
        />
      </div>

      {/* Centro: Logo Disaster Match */}
      <div className="absolute left-1/2 transform -translate-x-1/2 block">
        <Link to="/" className="flex items-center" aria-label={t("nav.disasterMatch")}>
          <img
            src="/Logo DM.png"
            alt={t("nav.disasterMatch")}
            className="h-8 sm:h-12 md:h-16 lg:h-20 w-auto drop-shadow-sm hover:opacity-90 transition-opacity"
            data-i18n="nav.disasterMatch"
          />
        </Link>
      </div>

      {/* Derecha: Tema + Auth-aware actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Show theme/language switchers only if NOT logged in */}
        {!loggedUser && (
          <>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t("nav.themeLight") : t("nav.themeDark")}
              title={isDark ? t("nav.themeLight") : t("nav.themeDark")}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 dark:border-slate-600 ${
                isDark
                  ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                  : "bg-white text-black hover:bg-gray-100"
              } transition`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label={t("nav.language")}
              className={`rounded-md border border-gray-300 dark:border-slate-600 px-2 py-1 text-sm transition
                ${isDark
                  ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                  : "bg-white text-black hover:bg-gray-100"
                }`}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </>
        )}
        {(() => {
          const path = routerState.location.pathname.toLowerCase();
          const isLanding = path === "/" || path === "/landingpage";

          if (loggedUser) {
            return (
              <>
                <Link
                  to="/HomePage"
                  className="hidden sm:inline-block text-gray-700 dark:text-gray-300 hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200"
                >
                  <span data-i18n="nav.disasterMatch">{t("nav.disasterMatch")}</span>
                </Link>

                {/* Profile dropdown */}
                <div
                  className="relative pb-2"
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
                      alt={t("nav.profile")}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 hover:opacity-90 transition"
                    />
                  </button>
                  {isProfileOpen && (
                    <div
                      role="menu"
                      className={`absolute right-0 top-full mt-2 w-48 border rounded-lg shadow-sm p-2 z-50 transition
                        ${isDark
                          ? "bg-[#1e293b] border-slate-700 text-gray-100"
                          : "bg-white border-gray-200 text-black"
                        }`}
                      onMouseEnter={!isTouch ? openProfile : undefined}
                      onMouseLeave={!isTouch ? () => closeProfileWithDelay() : undefined}
                    >
                      {/* Quick settings: theme & language */}
                      <div className="flex items-center gap-2 px-2 pb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            toggleTheme();
                          }}
                          aria-label={isDark ? t("nav.themeLight") : t("nav.themeDark")}
                          title={isDark ? t("nav.themeLight") : t("nav.themeDark")}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition
                            border-gray-300 dark:border-slate-600
                            ${isDark
                              ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                              : "bg-white text-black hover:bg-gray-100"
                            }`}
                        >
                          {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <select
                          value={i18n.language}
                          onChange={(e) => {
                            changeLanguage(e.target.value);
                            setIsProfileOpen(false);
                          }}
                          aria-label={t("nav.language")}
                          className={`flex-1 rounded-md border px-2 py-1 text-sm transition
                            border-gray-300 dark:border-slate-600
                            ${isDark
                              ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                              : "bg-white text-black hover:bg-gray-100"
                            }`}
                        >
                          <option value="en">EN</option>
                          <option value="es">ES</option>
                        </select>
                      </div>
                      <div className={`h-px my-1 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />

                      {/* Admin Panel (if admin) */}
                      {loggedUser?.role === "admin" && (
                        <Link
                          to="/AdminReports"
                          onClick={() => setIsProfileOpen(false)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-md transition
                            ${isDark
                              ? "text-gray-100 hover:bg-slate-800/60"
                              : "text-black hover:bg-gray-200"
                            }`}
                        >
                          <span data-i18n="nav.adminPanel">{t("nav.adminPanel")}</span>
                        </Link>
                      )}
                      <div className={`h-px my-1 ${isDark ? "bg-slate-700" : "bg-gray-200"}`} />

                      <Link
                        to="/Profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition
                          ${isDark
                            ? "text-gray-100 hover:bg-slate-800/60"
                            : "text-black hover:bg-gray-200"
                          }`}
                      >
                        <span data-i18n="nav.profile">{t("nav.profile")}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition
                          ${isDark
                            ? "text-red-400 hover:bg-red-600/30 hover:text-red-200"
                            : "text-red-600 hover:bg-red-500 hover:text-white"
                          }`}
                      >
                        <span data-i18n="nav.logout">{t("nav.logout")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          }

          // Not logged in
          return isLanding ? (
            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <Link
                to="/Login"
                className="px-4 py-2 text-sm md:text-base border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors duration-200"
              >
                <span data-i18n="nav.login">{t("nav.login")}</span>
              </Link>
              <Link
                to="/Register"
                className="px-4 py-2 text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <span data-i18n="nav.register">{t("nav.register")}</span>
              </Link>
            </div>
          ) : null;
        })()}
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        aria-hidden={!isMobileOpen}
        className={`sm:hidden ${isMobileOpen ? "block" : "hidden"}`}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" onClick={() => setIsMobileOpen(false)} />
        {/* Panel */}
        <div ref={mobileMenuRef} className="fixed top-[56px] left-2 right-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-4 z-50">
          {/* Show theme/language switchers only if NOT logged in */}
          {!loggedUser && (
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 dark:border-gray-700 transition
                  ${isDark
                    ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                    : "bg-white text-black hover:bg-gray-100"
                  }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className={`rounded-md border px-2 py-1 text-sm transition
                  ${isDark
                    ? "bg-[#1e293b] text-gray-100 hover:bg-[#334155]"
                    : "bg-white text-black hover:bg-gray-100"
                  }`}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>
          )}
          {loggedUser ? (
            <div className="flex flex-col gap-2">
              {loggedUser.role === "admin" && (
                <Link to="/AdminReports" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsMobileOpen(false)}>
                  {t("nav.adminPanel")}
                </Link>
              )}
              <Link to="/HomePage" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsMobileOpen(false)}>
                {t("nav.disasterMatch")}
              </Link>
              <Link to="/Profile" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsMobileOpen(false)}>
                {t("nav.profile")}
              </Link>
              <button type="button" className="px-3 py-2 text-left text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-600/20" onClick={() => { setIsMobileOpen(false); handleLogout(); }}>
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/Login" className="px-3 py-2 rounded-md border border-indigo-500 text-indigo-600 hover:bg-indigo-50" onClick={() => setIsMobileOpen(false)}>
                {t("nav.login")}
              </Link>
              <Link to="/Register" className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setIsMobileOpen(false)}>
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
