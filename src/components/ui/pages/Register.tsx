import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock } from "react-feather";

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
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Step 2
  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [user_address, setAddress] = useState("");
  const [company, setCompany] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function apiRegister(user: User) {
    const res = await fetch(`${API_URL}/Save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error("Server connection error");
    return await res.text();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const newUser: User = {
      f_name,
      l_name,
      username,
      email,
      user_password: password,
      phone,
      user_address,
      company,
      remember_token: "",
      fechaRegistro: new Date().toISOString(),
    };

    try {
      const msg = await apiRegister(newUser);

      if (msg.includes("almacenado correctamente")) {
        setSuccess("User registered successfully!");
        setTimeout(() => navigate({ to: "/Login" }), 1500);
      } else {
        setError("Registration failed. Please try again.");
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
      {/* Decorative circles */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>
      <div className="absolute w-40 h-40 bottom-10 left-10 rounded-full bg-indigo-200 opacity-30"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10">
        {/* Stepper */}
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

        <form
          className="space-y-6"
          onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
        >
          {step === 1 && (
            <>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </div>

              {/* Error for step 1 */}
              {error && step === 1 && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  const form = document.querySelector("form") as HTMLFormElement;

                  // 🚨 enforce validation of all required inputs
                  if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                  }

                  if (!email || !password || !confirm) {
                    setError("Please fill out all fields");
                    return;
                  }
                  if (password !== confirm) {
                    setError("Passwords do not match");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* First name */}
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

              {/* Last name */}
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

              {/* Username */}
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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md"
                  placeholder="+1 555 555 5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Address */}
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

              {/* Company */}
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

              {/* Messages */}
              {error && (
                <p className="text-red-500 text-sm font-medium text-center">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-600 text-sm font-medium text-center">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </>
          )}
        </form>

        {/* Link to login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
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
