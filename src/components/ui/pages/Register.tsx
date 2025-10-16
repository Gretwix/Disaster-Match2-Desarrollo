import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "react-feather";

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

const API_URL = "https://localhost:7044/Users";

export default function Register() {
  // Controla el paso actual del formulario (1: credenciales, 2: datos personales)
  const [step, setStep] = useState(1);

  // Estado para los campos del paso 1
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

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
    if (value !== password) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
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
    // Try POST first (new flow). If 405, retry with PUT for backward compatibility.
    // Also attempt HTTP fallback if HTTPS is unreachable.
    const makeUrl = (proto: 'https' | 'http') => `${proto}://localhost:7044/Users/Save`;
    const opts = (method: 'POST' | 'PUT') => ({
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    } as RequestInit);

    // Attempt HTTPS POST
    try {
      const res = await fetch(makeUrl('https'), opts('POST'));
      if (res.status === 405) {
        // Retry with PUT on HTTPS
        const resPut = await fetch(makeUrl('https'), opts('PUT'));
        return resPut;
      }
      return res;
    } catch {
      // HTTPS failed (connection refused, etc.) — try HTTP
      try {
        const res = await fetch(makeUrl('http'), opts('POST'));
        if (res.status === 405) {
          const resPut = await fetch(makeUrl('http'), opts('PUT'));
          return resPut;
        }
        return res;
      } catch (err) {
        throw err;
      }
    }
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
      setError("Passwords do not match");
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
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 1
                ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 flex-1 mx-2 self-center ${
              step === 2 ? "bg-indigo-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 2
                ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {step === 1 ? "Create your account" : "Personal details"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    className="pl-10 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full py-3 rounded-md"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Mensaje personalizado si el email no es válido
                    onInvalid={(e) =>
                      (e.currentTarget as HTMLInputElement).setCustomValidity(
                        "Please enter a valid email address"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="johndoe123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    className={`pl-10 bg-gray-50 border ${
                      passwordError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600'
                    } block w-full py-3 rounded-md`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.length ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <span className={`text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.upper ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <span className={`text-xs ${passwordStrength.upper ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.lower ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <span className={`text-xs ${passwordStrength.lower ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <span className={`text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      passwordStrength.special ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <span className={`text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                      At least one special character (@, #, $, %, &, *, !, ?)
                    </span>
                  </div>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    className={`pl-10 bg-gray-50 border ${
                      error && confirm ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600'
                    } block w-full py-3 rounded-md`}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={handleConfirmChange}
                  />
                </div>
                {error && confirm && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Error message if any */}
              {error && !confirm && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
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

                  if (password !== confirm) {
                    setError("Passwords do not match");
                    return;
                  }

                  // Check for duplicates in the backend
                  const ok = await checkDuplicates(email, username);
                  if (ok) {
                    setError("");
                    setStep(2);
                  }
                }}
                className={`w-full py-3 px-4 rounded-md text-white font-medium shadow-sm transition-all duration-200 ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </>
          )}

          {/* Paso 2: Datos personales */}
          {step === 2 && (
            <>
              {/* Campo First name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="John"
                  value={f_name}
                  onChange={(e) => setFName(e.target.value)}
                />
              </div>

              {/* Campo Last name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="Doe"
                  value={l_name}
                  onChange={(e) => setLName(e.target.value)}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div>
                  <input
                    type="tel"
                    className={`bg-gray-50 border ${
                      phoneError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600'
                    } block w-full px-3 py-3 rounded-md`}
                    placeholder="12345678"
                    value={phone}
                    inputMode="numeric"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers
                      if (value === '' || /^\d*$/.test(value)) {
                        setPhone(value);
                        // Real-time validation
                        if (value && (value.length < 8 || value.length > 15)) {
                          setPhoneError('Phone number must be between 8 and 15 digits');
                        } else {
                          setPhoneError('');
                        }
                      }
                    }}
                    onBlur={() => {
                      // Validation on blur
                      if (phone && (phone.length < 8 || phone.length > 15)) {
                        setPhoneError('Phone number must be between 8 and 15 digits');
                      } else {
                        setPhoneError('');
                      }
                    }}
                  />
                </div>
                {phoneError ? (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Only numbers allowed. Must be 8-15 digits.
                  </p>
                )}
              </div>

              {/* Campo Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="Street, City"
                  value={user_address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Campo Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              {/* Mensajes de error y éxito */}
              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}
              {success && (
                <div className="text-center space-y-2">
                  <p className="text-green-600 text-sm font-medium">{success}</p>
                  <p className="text-gray-600 text-xs">Didn’t get the email? You can resend it from the verification page.</p>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/verify-email" })}
                    className="text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                    Go to verification page
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
                    setPhoneError('Por favor ingresa un número de teléfono válido');
                  }
                }}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </>
          )}
        </form>

        {/* Enlace para ir al login si ya tienes cuenta */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/Login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
