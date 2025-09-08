import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";

/**
 * Componente para solicitar el restablecimiento de contraseña.
 * El usuario ingresa su email y, si existe, recibirá un enlace para cambiar la contraseña.
 */
export default function ForgotPassword() {
  // Estado para el email ingresado por el usuario
  const [email, setEmail] = useState("");
  // Estado para mostrar mensajes de éxito o error
  const [message, setMessage] = useState("");
  // Hook para navegar entre rutas
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario.
   * Envía el email al backend para solicitar el enlace de restablecimiento.
   * Si el backend responde con un token, navega automáticamente a la pantalla de cambio de contraseña.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Envía el email como string plano al endpoint de recuperación
      const res = await fetch("https://localhost:7044/Users/ForgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `"${email}"`, // enviar como string plano
      });

      // Procesa la respuesta del backend
      const data = await res.json();
      console.log("ForgotPassword response:", data);

      // Muestra mensaje genérico para evitar revelar si el email existe
      setMessage(
        data.message || "If this email exists, you will receive a reset link."
      );

      // Si el backend responde con un token, navega a la pantalla de cambio de contraseña
      if (data.token) {
        navigate({ to: "/ResetPassword", search: { token: data.token } });
      }
    } catch (err) {
      // Si ocurre un error de red o servidor, muestra mensaje de error
      console.error("Error in ForgotPassword:", err);
      setMessage("Server connection error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Círculos decorativos de fondo */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>
      <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div> 
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Forgot your password?
        </h1>

        {/* Formulario para ingresar el email */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
          >
            Send reset link
          </button>
        </form>

        {/* Mensaje informativo de éxito o error */}
        {message && (
          <p className="text-sm text-gray-600 mt-4 text-center">{message}</p>
        )}

        {/* Enlace para volver al login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Remembered your password?{" "}
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