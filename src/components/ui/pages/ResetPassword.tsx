import { useState } from "react";
import { useSearch, useNavigate, Link } from "@tanstack/react-router";

/**
 * Componente para restablecer la contraseña del usuario.
 * Utiliza el token recibido por URL para validar la operación.
 */
export default function ResetPassword() {
  // Obtiene el parámetro 'token' de la URL usando el sistema de rutas
  const search = useSearch({ from: "/ResetPassword" });
  const tokenFromUrl = search.token as string | undefined;
  const navigate = useNavigate();

  // Estados para los campos del formulario y mensajes
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Maneja el envío del formulario de restablecimiento de contraseña.
   * Valida los campos, envía la petición al backend y muestra mensajes.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica que el token exista en la URL
    if (!tokenFromUrl) {
      setMessage("Invalid or missing token");
      setIsSuccess(false);
      return;
    }

    // Verifica que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      return;
    }

    try {
      // Envía la nueva contraseña y el token al backend
      const res = await fetch("https://localhost:7044/Users/ResetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromUrl, newPassword }),
      });

      // Si la respuesta no es exitosa, muestra error
      if (!res.ok) {
        throw new Error("Error resetting password");
      }

      // Si todo sale bien, muestra mensaje de éxito y redirige al login
      setMessage("Password reset successfully! Redirecting to login...");
      setIsSuccess(true);

      setTimeout(() => {
        navigate({ to: "/Login" });
      }, 2000);
    } catch (err) {
      // Si ocurre un error en el servidor, muestra mensaje de error
      console.error("Reset password error:", err);
      setMessage("Server error. Please try again later.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Círculos decorativos de fondo */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>
      <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div> 
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Reset Password
        </h1>

        {/* Formulario para ingresar la nueva contraseña */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo para la nueva contraseña */}
          <input
            type="password"
            placeholder="Nueva contraseña"
            required
            className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {/* Campo para confirmar la nueva contraseña */}
          <input
            type="password"
            placeholder="Confirmar contraseña"
            required
            className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Botón para enviar el formulario */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
          >
            Cambiar contraseña
          </button>
        </form>

        {/* Mensaje de éxito o error */}
        {message && (
          <p
            className={`mt-4 text-sm text-center font-medium ${
              isSuccess ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Enlace para volver al login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already remembered your password?{" "}
            <Link
              to="/Login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}