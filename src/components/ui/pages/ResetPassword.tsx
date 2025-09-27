import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";

export default function ResetPassword() {
  const navigate = useNavigate();

  // Estados para el paso actual, código, contraseñas y mensajes
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Estado para el temporizador (10 minutos )
  const [timeLeft, setTimeLeft] = useState(600);

  // Temporizador para el código de recuperación
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Formatea el tiempo restante en mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Validación del código con el backend
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setMessage("Please enter the code");
      return;
    }
    if (timeLeft <= 0) {
      setMessage("Code expired. Please request a new one.");
      return;
    }

    try {
      const res = await fetch("https://localhost:7044/Users/VerifyResetCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        setMessage("Invalid or expired code");
        return;
      }

      const data = await res.json();
      setMessage(data.message);
      setStep(2); // Solo pasa si el backend confirma que es válido
    } catch (err) {
      console.error("Error verifying code:", err);
      setMessage("Server error, try again later");
    }
  };

  // Cambio de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      return;
    }

    try {
      const res = await fetch("https://localhost:7044/Users/ResetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, newPassword }),
      });

      if (!res.ok) throw new Error("Error resetting password");

      setMessage("Password reset successfully! Redirecting to login...");
      setIsSuccess(true);

      setTimeout(() => {
        navigate({ to: "/Login" });
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage("Invalid code or server error");
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 overflow-hidden relative">
      {/* Círculos decorativos */}
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-40 h-40 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>
      <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Reset Password
        </h1>

        {step === 1 ? (
          // Paso 1: código
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={`Enter reset code (${formatTime(timeLeft)})`}
              required
              className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            >
              Verify Code
            </button>
          </form>
        ) : (
          // Paso 2: nueva contraseña
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              required
              className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              required
              className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            >
              Change Password
            </button>
          </form>
        )}

        {message && (
          <p
            className={`mt-4 text-sm text-center font-medium ${
              isSuccess ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

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
