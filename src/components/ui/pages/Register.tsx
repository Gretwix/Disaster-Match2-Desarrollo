/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import { useState } from "react";
import { API_BASE } from "../../../utils/api";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "react-feather";
import { formatPhone, validatePhone } from "../../../utils/phoneValidation";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Tipo de usuario para el registro
type User = {
  f_name: string;
  l_name: string;
  username: string;
  email: string;
  user_password: string;
  phone: string;
  user_address: string;
  company: string;
  remember_token: string;
  fechaRegistro: string;
};

const API_URL = `${API_BASE}/Users`;

export default function Register() {
  // Controla el paso actual del formulario (1: credenciales, 2: datos personales)
  const [step, setStep] = useState(1);

  // Estado para los campos del paso 1
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const { t } = useTranslation();

  // Validate password in real-time
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
      setPasswordError("");
      return false;
    }

    if (!Object.values(validations).every(Boolean)) {
      setPasswordError("Password does not meet requirements");
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Validate password confirmation
  const validateConfirmPassword = (value: string) => {
    // Only show mismatch when both fields have a value
    if (value && password && value !== password) {
      setConfirmError("register.errorPasswordsMismatch");
      return false;
    }
    setConfirmError("");
    return true;
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirm) {
      validateConfirmPassword(confirm);
    }
  };

  // Handle confirm password change
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirm(value);
    validateConfirmPassword(value);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (step === 1) {
      return (
        email &&
        username &&
        password &&
        confirm &&
        !passwordError &&
        !confirmError &&
        !error &&
        Object.values(passwordStrength).every(Boolean)
      );
    }
    return true;
  };

  // Estado para los campos del paso 2
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [user_address, setAddress] = useState("");
  const [company, setCompany] = useState("");

  // Estado para mensajes y navegación
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Envía los datos del usuario al backend para registrar una nueva cuenta.
   * @param user Objeto con los datos del usuario
   */
  async function apiRegister(user: User) {
    // Use centralized API base; in dev Vite proxies /api -> target server (vite.config.ts)
    // Try POST first; if 405, fallback to PUT for backward compatibility.
    const url = `${API_BASE}/Users/Save`;
    const opts = (method: "POST" | "PUT") => ({
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    } as RequestInit);

    const res = await fetch(url, opts("POST")).catch((e) => {
      throw e;
    });
    if (res.status === 405) {
      const resPut = await fetch(url, opts("PUT"));
      return resPut;
    }
    return res;
  }

  /**
   * Verifica si el email o el nombre de usuario ya existen en la base de datos.
   * @param rawEmail Email ingresado por el usuario
   * @param rawUsername Username ingresado por el usuario
   * @returns true si no hay duplicados, false si ya existen
   */
  async function checkDuplicates(rawEmail: string, rawUsername: string) {
    const res = await fetch(`${API_URL}/List`);
    if (!res.ok) return false;

    const users = await res.json();
    const em = rawEmail.trim().toLowerCase();
    const un = rawUsername.trim().toLowerCase();

    // Verifica email duplicado
    if (users.some((u: any) => (u.email || "").toLowerCase() === em)) {
      setError("Email is already registered");
      return false;
    }
    // Verifica username duplicado
    if (users.some((u: any) => (u.username || "").toLowerCase() === un)) {
      setError("Username is already taken");
      return false;
    }
    return true;
  }

  /**
   * Envía el formulario de registro al backend.
   * Valida contraseñas y muestra mensajes según la respuesta.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validación de contraseñas
    if (password !== confirm) {
      setError("PASSWORD_MISMATCH");
      setLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      setPhoneError("Phone number must be between 7 and 15 digits");
      setLoading(false);
      return;
    }

    if (
      !f_name.trim() ||
      !l_name.trim() ||
      !/^[a-zA-ZÀ-ÿ\s]+$/.test(f_name.trim()) ||
      !/^[a-zA-ZÀ-ÿ\s]+$/.test(l_name.trim()) ||
      f_name.trim().length < 2 ||
      l_name.trim().length < 2
    ) {
      toast.error("Please enter valid first and last names (letters only, at least 2 characters).");
      setLoading(false);
      return;
    }

    // Construye el objeto usuario
    const newUser: User = {
      f_name,
      l_name,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      user_password: password,
      phone,
      user_address,
      company,
      remember_token: "",
      fechaRegistro: new Date().toISOString(),
    };

    try {
      // Llama a la API para registrar el usuario
      const res = await apiRegister(newUser);

      if (res.ok) {
        // Success even if not active yet – show instruction to verify email
        setSuccess("Registration successful. Check your email to verify your account.");
        // Do NOT auto-login; prompt user to go to login after verifying
      } else {
        const text = await res.text().catch(() => "");
        if (res.status === 409 && text.toLowerCase().includes("email")) {
          setError("Email is already registered");
        } else if (res.status === 409 && text.toLowerCase().includes("username")) {
          setError("Username is already taken");
        } else {
          setError(text || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>
      <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10">
        {/* Stepper visual para mostrar el progreso del registro */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 1
              ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            1
          </div>
          <div
            className={`h-1 flex-1 mx-2 self-center ${step === 2 ? "bg-indigo-600" : "bg-gray-200"
              }`}
          />
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2
              ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            2
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {step === 1 ? t("register.titleStep1") : t("register.titleStep2")}
        </h1>

        {/* Formulario de registro dividido en dos pasos */}
        <form
          className="space-y-6"
          onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
        >
          {/* Paso 1: Credenciales */}
          {step === 1 && (
            <>
              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.email">
                  {t("register.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    className="pl-10 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full py-3 rounded-md"
                    placeholder={t("register.placeholderEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInvalid={(e) =>
                      (e.currentTarget as HTMLInputElement).setCustomValidity(
                        t("register.invalidEmail")
                      )
                    }
                    onInput={(e) =>
                      (e.currentTarget as HTMLInputElement).setCustomValidity("")
                    }
                  />
                </div>
              </div>

              {/* Campo Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.username">
                  {t("register.username")}
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder={t("register.placeholderUsername")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.password">
                  {t("register.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    className={`pl-10 bg-gray-50 border ${passwordError
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      } block w-full py-3 rounded-md`}
                    placeholder={t("register.placeholderPassword")}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>

                {/* Advertencias de contraseña (ya traducidas previamente) */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className={`text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`} data-i18n="register.pwdLength">
                      {t("register.pwdLength")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.upper ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className={`text-xs ${passwordStrength.upper ? 'text-green-600' : 'text-gray-500'}`} data-i18n="register.pwdUpper">
                      {t("register.pwdUpper")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.lower ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className={`text-xs ${passwordStrength.lower ? 'text-green-600' : 'text-gray-500'}`} data-i18n="register.pwdLower">
                      {t("register.pwdLower")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className={`text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`} data-i18n="register.pwdNumber">
                      {t("register.pwdNumber")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <span className={`text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`} data-i18n="register.pwdSpecial">
                      {t("register.pwdSpecial")}
                    </span>
                  </div>
                </div>

                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{t("register.errorPwdRequirements")}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.confirmPassword">
                  {t("register.confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    className={`pl-10 bg-gray-50 border ${confirmError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600'} block w-full py-3 rounded-md`}
                    placeholder={t("register.placeholderConfirm")}
                    value={confirm}
                    onChange={handleConfirmChange}
                  />
                </div>
                {confirmError && (
                  <p className="mt-1 text-sm text-red-600">{t(confirmError)}</p>
                )}
              </div>

              {/* Error message if any */}
              {error && !confirmError && (
                <p className="text-red-500 text-sm font-medium text-center">{t(errorKeyMapper(error))}</p>
              )}

              {/* Continue Button - Validates fields and checks for duplicates */}
              <button
                type="button"
                disabled={!isFormValid()}
                onClick={async () => {
                  // Force HTML5 validation
                  const form = document.querySelector("form") as HTMLFormElement;
                  if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                  }

                  if (!validatePassword(password)) {
                    return;
                  }

                  // Recheck confirm match explicitly before checking duplicates
                  if (!validateConfirmPassword(confirm)) {
                    return;
                  }

                  // Check for duplicates in the backend
                  const ok = await checkDuplicates(email, username);
                  if (ok) {
                    setError("");
                    setConfirmError("");
                    setStep(2);
                  }
                }}
                className={`w-full py-3 px-4 rounded-md text-white font-medium shadow-sm transition-all duration-200 ${isFormValid() ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}
                data-i18n="register.continue"
              >
                {t("register.continue")}
              </button>
            </>
          )}

          {/* Paso 2: Datos personales */}
          {step === 2 && (
            <>
              {/* First name */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  data-i18n="register.firstName"
                >
                  {t("register.firstName")}
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder={t("register.placeholderFirstName")}
                  value={f_name}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (/^[a-zA-ZÀ-ÿ\s]*$/.test(raw)) {
                      setFName(raw);
                    } else {
                      toast.error("Only letters and spaces are allowed");
                    }
                  }}
                />
              </div>

              {/* Last name */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  data-i18n="register.lastName"
                >
                  {t("register.lastName")}
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder={t("register.placeholderLastName")}
                  value={l_name}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (/^[a-zA-ZÀ-ÿ\s]*$/.test(raw)) {
                      setLName(raw);
                    } else {
                      toast.error("Only letters and spaces are allowed");
                    }
                  }}
                />
              </div>


              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.phone">{t("register.phone")}</label>
                <div>
                  <input
                    type="tel"
                    className={`bg-gray-50 border ${phoneError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600'
                      } block w-full px-3 py-3 rounded-md`}
                    placeholder="+1 xxx xxx xxxx"
                    value={phone}
                    inputMode="numeric"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const formatted = formatPhone(raw);
                      setPhone(formatted);
                      // Allow only numbers
                      if (/^\d*$/.test(raw)) {
                        const formatted = formatPhone(raw);
                        setPhone(formatted);
                        setPhoneError(validatePhone(formatted) ? '' : 'Phone number must be between 7 and 15 digits');
                      }
                    }}
                    onBlur={() => {
                      setPhoneError(validatePhone(phone) ? '' : 'Phone number must be between 7 and 15 digits');
                    }}
                  />
                </div>
                {phoneError ? (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Only numbers allowed. Must be 7-15 digits.
                  </p>
                )}
              </div>

              {/* Campo Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.address">
                  {t("register.address")}
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder={t("register.placeholderAddress")}
                  value={user_address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Campo Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" data-i18n="register.company">
                  {t("register.company")}
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder={t("register.placeholderCompany")}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              {/* Mensajes de error y éxito */}
              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{t(errorKeyMapper(error))}</p>
              )}
              {success && (
                <div className="text-center space-y-2">
                  <p className="text-green-600 text-sm font-medium">{t("register.success")}</p>
                  <p className="text-gray-600 text-xs">{t("register.resendVerifyNote")}</p>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/verify-email" })}
                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                    data-i18n="register.goToVerification"
                  >
                    {t("register.goToVerification")}
                  </button>
                </div>
              )}

              {/* Botón para enviar el formulario */}
              <button
                type="submit"
                disabled={loading || !!phoneError}
                className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                onClick={(e) => {
                  // Validar el teléfono antes de enviar el formulario
                  if (phone && !/^[0-9+\-()\s]+$/.test(phone)) {
                    e.preventDefault();
                    setPhoneError(t("register.invalidPhone"));
                  }
                }}
                data-i18n="register.register"
              >
                {loading ? t("register.registering") : t("register.register")}
              </button>
            </>
          )}
        </form>

        {/* Enlace para ir al login si ya tienes cuenta */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t("register.alreadyHave")}{" "}
            <a
              href="/Login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              data-i18n="register.signIn"
            >
              {t("register.signIn")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper: map some internal error markers to i18n keys (keeps logic unchanged)
function errorKeyMapper(key: string) {
  switch (key) {
    case "PASSWORD_MISMATCH":
      return "register.errorPasswordsMismatch";
    default:
      return key; // fall back: if key already i18n key or raw message, leave caller to handle
  }
}
