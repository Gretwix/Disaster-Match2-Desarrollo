import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "react-feather";

export default function Faq() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f9fafb] flex justify-center py-12 px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>{t("contactForm.back")}</span>
        </button>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {t("faq.title")}
          </h1>
        </header>

        <div className="h-[70vh] overflow-y-auto pr-2 text-gray-700 leading-relaxed space-y-8">
          {[...Array(11)].map((_, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold mb-2 text-indigo-600">
                {t(`faq.q${i + 1}.question`)}
              </h2>
              <p>{t(`faq.q${i + 1}.answer1`)}</p>
              {/* Para la pregunta 3 y 11 hay respuestas con saltos de línea o varias partes */}
              {t(`faq.q${i + 1}.answer2`, "") && (
                <p className="mt-3">{t(`faq.q${i + 1}.answer2`)}</p>
              )}
            </section>
          ))}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-8 border-t pt-4">
          {t("footer.copyright", {
            year: new Date().getFullYear(),
            name: "DisasterMatch",
          })}
        </footer>
      </div>
    </div>
  );
}
