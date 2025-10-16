// Componente contenedor base para toda la aplicación.
// Se encarga de envolver las páginas con un fondo y altura mínima,
// garantizando una experiencia visual coherente y unificada.

// Importamos ReactNode que permite aceptar cualquier contenido como children.
import type { ReactNode } from "react";
import { useEffect } from "react";
import ChatBubble from "./ChatBubble";

// Definimos las props que acepta este componente.
// children: cualquier contenido JSX que será renderizado dentro del layout.
interface LayoutProps {
  children: ReactNode;
}

// Componente funcional principal.
// Envuelve el contenido con clases de Tailwind para diseño global.
export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const applyTheme = (explicit?: "light" | "dark") => {
      try {
        const stored = explicit ?? (localStorage.getItem("theme") as "light" | "dark" | null);
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = stored ? stored === "dark" : prefersDark;
        const root = document.documentElement;
        const body = document.body;
        const app = document.getElementById("root");
        if (isDark) {
          root.classList.add("dark");
          body && body.classList.add("dark");
          // Ensure app does not independently carry 'dark' to avoid scoping issues
          app && app.classList.remove("dark");
        } else {
          root.classList.remove("dark");
          body && body.classList.remove("dark");
          app && app.classList.remove("dark");
        }
      } catch {}
    };

    applyTheme();

    // Sync on storage changes (from other tabs or programmatically)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") applyTheme();
    };
    window.addEventListener("storage", onStorage);

    // Sync on OS theme changes if no explicit preference
    const mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const onChange = () => {
      if (!localStorage.getItem("theme")) applyTheme();
    };
    mql?.addEventListener?.("change", onChange as any);

    return () => {
      window.removeEventListener("storage", onStorage);
      mql?.removeEventListener?.("change", onChange as any);
    };
  }, []);
  return (
    // Establece un fondo gris claro y asegura que la altura mínima sea toda la pantalla.
    // Esto evita que páginas pequeñas dejen espacios blancos innecesarios.
    <div className="min-h-screen bg-gray-50">
      {children}
       <ChatBubble />
    </div>
  );
}