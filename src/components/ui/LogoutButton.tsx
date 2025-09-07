// ui/LogoutButton.tsx
import { useNavigate } from "@tanstack/react-router";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken"); // guardamos esto al loguear

      if (token) {
        await fetch("https://localhost:7044/Users/Logout", {
          method: "POST",
          headers: {
            "Authorization": token,
          },
        });
      }

      // limpiar datos del usuario
      localStorage.removeItem("authToken");
      localStorage.removeItem("loggedUser");

      // redirigir al login
      navigate({ to: "/Login" });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
