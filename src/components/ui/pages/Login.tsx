import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "react-feather";

export default function Login() {
  // Estados para los campos del formulario y mensajes
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de login.
   * Envía los datos al backend y gestiona la autenticación.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Realiza la petición al endpoint de login
      const res = await fetch("https://localhost:7044/Users/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Si las credenciales son incorrectas
      if (res.status === 401) {
        setError("Invalid email or password");
        return;
      }

      // Si hay otro error en el servidor
      if (!res.ok) {
        throw new Error("Server error");
      }

  // Si el login es exitoso, guarda el token y usuario en localStorage
  const data = await res.json();
  // Asignar rol según el ID
  const userId = data.ID ?? data.id;
  data.role = userId === 2 ? "admin" : "user";
  localStorage.setItem("authToken", data.token);
  localStorage.setItem("loggedUser", JSON.stringify(data));

  // Redirige al usuario a la página principal
  navigate({ to: "/HomePage" });
    } catch (err) {
      console.error("Login error:", err);
      setError("Server connection error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>

      {/* Tarjeta de login */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <Lock className="text-indigo-600 w-8 h-8" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Formulario de login */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="email"
                required
                className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md transition duration-150"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Password */}
<div>
  <div className="flex justify-between items-center mb-1">
    <label className="block text-sm font-medium text-gray-700">
      Password
    </label>
    <a
      href="/forgot-password"
      onClick={(e) => {
        e.preventDefault();
        navigate({ to: "/ForgotPassword" });
      }}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
    >
      Forgot password?
    </a>
  </div>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Lock className="text-gray-400 w-5 h-5" />
    </div>
    <input
      type="password"
      required
      className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md transition duration-150"
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>
</div>


          {/* Mensaje de error si ocurre */}
          {error && (
            <p className="text-red-500 text-sm font-medium text-center">
              {error}
            </p>
          )}

          {/* Botón de login */}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            >
              Sign in
            </button>
          </div>
        </form>

        {/* Enlace para ir al registro si no tienes cuenta */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
