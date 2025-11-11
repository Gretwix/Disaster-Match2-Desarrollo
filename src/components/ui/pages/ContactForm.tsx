import { useRef, useState, useEffect } from "react";
import { Mail, User, MessageSquare, ArrowLeft } from "react-feather";
import { useNavigate } from "@tanstack/react-router";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import apiUrl from "../../../utils/api";
import { useTranslation } from "react-i18next";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // noop
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);

    const data = {
      Name: String(formData.get("name") || ""),
      Email: String(formData.get("email") || ""),
      Message: String(formData.get("message") || ""),
    };

    try {
      const res = await fetch(apiUrl("/Contact/Send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        toast.error(t("contactForm.error") + ": " + text);
        return;
      }

      const result = await res.json();
      toast.success(result.message || t("contactForm.successToast"));

      if (formRef.current) {
        formRef.current.reset();
      }

      Swal.fire({
        icon: "success",
        title: t("contactForm.successTitle"),
        text: t("contactForm.successText"),
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        navigate({ to: "/" });
      });
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(t("contactForm.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-72 h-72 -top-20 -left-20 rounded-full bg-indigo-200 opacity-30"></div>
      <div className="absolute w-48 h-48 top-1/3 -right-24 rounded-full bg-indigo-300 opacity-30"></div>
      <div className="absolute w-96 h-96 bottom-0 right-0 translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-100 opacity-40"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8 z-10">
        {/* Botón volver */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>{t("contactForm.back")}</span>
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <MessageSquare className="text-indigo-600 w-8 h-8" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("contactForm.title")}
          </h1>
          <p className="text-gray-500">{t("contactForm.subtitle")}</p>
        </div>

        {/* Formulario */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("contactForm.name")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                required
                className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md transition"
                placeholder={t("contactForm.namePlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("contactForm.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full pl-10 py-3 rounded-md transition"
                placeholder={t("contactForm.emailPlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("contactForm.message")}
            </label>
            <textarea
              name="message"
              rows={4}
              required
              className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 block w-full px-3 py-3 rounded-md transition"
              placeholder={t("contactForm.messagePlaceholder")}
            ></textarea>
          </div>

          {status && (
            <p
              className={`text-sm font-medium text-center ${
                status.startsWith("❌") ? "text-red-500" : "text-green-600"
              }`}
            >
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white font-medium shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? t("contactForm.sending") : t("contactForm.send")}
          </button>
        </form>
      </div>
    </div>
  );
}
