// Componente contenedor base para toda la aplicación.
// Se encarga de envolver las páginas con un fondo y altura mínima,
// garantizando una experiencia visual coherente y unificada.

// Importamos ReactNode que permite aceptar cualquier contenido como children.
import type { ReactNode } from "react";

// Definimos las props que acepta este componente.
// children: cualquier contenido JSX que será renderizado dentro del layout.
interface LayoutProps {
  children: ReactNode;
}

// Componente funcional principal.
// Envuelve el contenido con clases de Tailwind para diseño global.
export default function Layout({ children }: LayoutProps) {
  return (
    // Establece un fondo gris claro y asegura que la altura mínima sea toda la pantalla.
    // Esto evita que páginas pequeñas dejen espacios blancos innecesarios.
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}