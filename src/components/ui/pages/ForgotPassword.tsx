import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("https://localhost:7044/Users/ForgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `"${email}"`, // el backend espera string plano
      });

      const data = await res.json();
      setMessage(data.message || "If this email exists, you will receive a reset link.");
      toast.success(data.message || "If this email exists, you will receive a reset link.");
      Swal.fire({
        title: "Check your email",
        text: data.message || "If this email exists, you will receive a reset link.",
        icon: "info",
        confirmButtonColor: "#4F46E5",
      });

      // ✅ Después de enviar el correo, redirige a ResetPassword
      navigate({ to: "/ResetPassword" });
    } catch (err) {
      console.error("Error in ForgotPassword:", err);
      setMessage("Server connection error");
      toast.error("Server connection error");
      Swal.fire({
        title: "Error",
        text: "Server connection error",
        icon: "error",
        confirmButtonColor: "#DC2626",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 overflow-hidden relative">
  {/* 🔹 Círculos decorativos */}
  <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
  <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div>
  <div className="absolute w-32 h-32 top-10 left-1/3 rounded-full bg-indigo-400 opacity-20"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Forgot your password?
        </h1>

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
            Send reset code
          </button>
        </form>

        {message && (
          <p className="text-sm text-gray-600 mt-4 text-center">{message}</p>
        )}

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
