import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "react-feather";
import { useEffect } from "react";

export default function TermsOfUsePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // noop
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#0b1220] force-light-bg-gray-100 flex justify-center py-12 px-6">
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
            {t("terms.title")}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {t("terms.lastUpdated", { date: "October 13, 2025" })}
          </p>
        </header>

        <div className="h-[70vh] overflow-y-auto pr-2 text-gray-700 leading-relaxed space-y-8">
          <section>
            <p>{t("terms.intro")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section1.title")}
            </h2>
            <p>{t("terms.section1.p1")}</p>
            <p className="mt-3">{t("terms.section1.p2")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section2.title")}
            </h2>
            <p>{t("terms.section2.p1")}</p>
            <p className="mt-3">{t("terms.section2.p2")}</p>
            <p className="mt-3">{t("terms.section2.p3")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section3.title")}
            </h2>
            <p>{t("terms.section3.p1")}</p>
            <p className="mt-3">{t("terms.section3.p2")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section4.title")}
            </h2>
            <p>{t("terms.section4.p1")}</p>
            <p className="mt-3">{t("terms.section4.p2")}</p>
            <p className="mt-3">{t("terms.section4.p3")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section5.title")}
            </h2>
            <p>{t("terms.section5.p1")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section11.title")}
            </h2>
            <p>{t("terms.section11.p1")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section12.title")}
            </h2>
            <p>{t("terms.section12.p1")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section13.title")}
            </h2>
            <p>{t("terms.section13.p1")}</p>
            <p className="mt-3">{t("terms.section13.p2")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section14.title")}
            </h2>
            <p>{t("terms.section14.p1")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section15.title")}
            </h2>
            <p>{t("terms.section15.p1")}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              {t("terms.section16.title")}
            </h2>
            <p>{t("terms.section16.p1")}</p>
            <p className="mt-3">{t("terms.section16.p2")}</p>
          </section>
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
