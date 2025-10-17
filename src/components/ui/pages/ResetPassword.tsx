import { useState, useEffect } from "react";
import apiUrl from "../../../utils/api";
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
  const res = await fetch(apiUrl("/Users/VerifyResetCode"), {
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

  // Estado para la fortaleza de la contraseña
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // Validación de contraseña en tiempo real
  const validatePassword = (value: string) => {
    const validations = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@#$%&*!?]/.test(value),
    };
    setPasswordStrength(validations);

    if (value === "") {
      setMessage("");
      setIsSuccess(false);
      return false;
    }

    if (!Object.values(validations).every(Boolean)) {
      setMessage("Password does not meet requirements");
      setIsSuccess(false);
      return false;
    }

    setMessage("");
    return true;
  };

  // Validar confirmación de contraseña
  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      return false;
    }
    setMessage("");
    return true;
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  // Manejar cambio en confirmación
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  // Cambio de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      return;
    }

    try {
  const res = await fetch(apiUrl("/Users/ResetPassword"), {
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
            <div>
              <input
                type="password"
                placeholder="New password"
                required
                className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
                value={newPassword}
                onChange={handlePasswordChange}
              />

              {/* Indicadores de fortaleza de contraseña */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.length ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength.length ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.upper ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength.upper ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least one uppercase letter
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.lower ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength.lower ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least one lowercase letter
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.number ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength.number ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least one number
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.special ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                  <span
                    className={`text-xs ${
                      passwordStrength.special ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    At least one special character (@, #, $, %, &, *, !, ?)
                  </span>
                </div>
              </div>
            </div>

            <input
              type="password"
              placeholder="Confirm password"
              required
              className="w-full border rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600"
              value={confirmPassword}
              onChange={handleConfirmChange}
            />
            <button
              type="submit"
              disabled={
                !Object.values(passwordStrength).every(Boolean) ||
                newPassword !== confirmPassword
              }
              className={`w-full py-3 px-4 rounded-md text-white font-medium shadow-sm transition-all duration-200 ${
                Object.values(passwordStrength).every(Boolean) &&
                newPassword === confirmPassword
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
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
