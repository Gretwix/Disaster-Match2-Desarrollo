import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, AlertCircle, Mail } from "react-feather";
import { notifyError, notifySuccess } from "../../../utils/notify";
import { API_BASE } from "../../../utils/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Please use the link from your email.");
        return;
      }
      setStatus("loading");
      try {
        let res = await fetch(`${API_BASE}/Users/VerifyEmail?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });
        // no secondary fallback: API_BASE is authoritative

        if (res.ok) {
          const text = await res.text().catch(() => "");
          setStatus("success");
          setMessage(text || "Your email has been verified successfully.");
          notifySuccess("Email verified! You can now sign in.");
        } else if (res.status === 400) {
          const text = await res.text().catch(() => "Invalid or expired verification link.");
          setStatus("error");
          setMessage(text || "Invalid or expired verification link.");
        } else {
          const text = await res.text().catch(() => "");
          setStatus("error");
          setMessage(text || `Verification failed (${res.status}). Try again later.`);
        }
      } catch (err) {
        console.error("VerifyEmail error:", err);
        setStatus("error");
        setMessage("Could not reach the server. Please try again.");
        notifyError("Network error while verifying email");
      }
    }

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email) {
      notifyError("Please enter your email");
      return;
    }
    setResending(true);
    try {
      let res = await fetch(`${API_BASE}/Users/ResendVerification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // single base only
      if (res.ok) {
        const text = await res.text().catch(() => "");
        notifySuccess(text || "Verification email resent. Check your inbox.");
      } else {
        const text = await res.text().catch(() => "");
        notifyError(text || `Could not resend email (${res.status}).`);
      }
    } catch (err) {
      console.error("ResendVerification error:", err);
      notifyError("Network error while resending email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30" />
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30" />
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          {status === "success" ? (
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
          ) : status === "loading" ? (
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center animate-pulse">
              <Mail className="text-indigo-600 w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="text-red-600 w-8 h-8" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {status === "success" && "Email verified"}
          {status === "loading" && "Verifying your email"}
          {status === "error" && "Verification issue"}
        </h1>
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {status === "success" && (
          <button
            className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
            onClick={() => navigate({ to: "/Login" })}
          >
            Go to login
          </button>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-md px-3 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              disabled={resending || !email}
              onClick={handleResend}
              className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend verification email"}
            </button>
            <div className="text-center">
              <button
                className="text-indigo-600 hover:text-indigo-500"
                onClick={() => navigate({ to: "/Login" })}
              >
                Back to login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
