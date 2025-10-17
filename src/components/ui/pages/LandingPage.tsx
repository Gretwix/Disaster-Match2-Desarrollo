import { useNavigate } from "@tanstack/react-router";
import { FaFilter, FaDatabase, FaClock } from "react-icons/fa";
import Footer from "../Footer";
import { useTranslation } from "react-i18next";
export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
  <div className="min-h-screen grid grid-rows-[1fr_auto] bg-gray-50">
    {/* Contenido principal */}
    <main>
      <section className="bg-gray-50 text-center py-20 px-6">
  <h1 className="text-3xl md:text-4xl font-bold mb-4" data-i18n="landing.title">
    {t("landing.title")}
  </h1>
  <p className="text-gray-600 max-w-2xl mx-auto mb-8" data-i18n="landing.subtitle">
    {t("landing.subtitle")}
  </p>
  <div className="flex justify-center gap-4">
    <button
      onClick={() => navigate({ to: "/HomePage" })}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
      data-i18n="landing.startNow"
    >
      {t("landing.startNow")}
    </button>
  </div>
</section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold mb-12" data-i18n="landing.benefitsTitle">
            {t("landing.benefitsTitle")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaFilter />
              </div>
              <h3 className="font-semibold mb-2" data-i18n="landing.filterType">{t("landing.filterType")}</h3>
              <p className="text-gray-600 text-sm" data-i18n="landing.boostSalesDesc">{t("landing.boostSalesDesc")}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaDatabase />
              </div>
              <h3 className="font-semibold mb-2" data-i18n="landing.completeData">{t("landing.completeData")}</h3>
              <p className="text-gray-600 text-sm" data-i18n="landing.saveTimeDesc">{t("landing.saveTimeDesc")}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaClock />
              </div>
              <h3 className="font-semibold mb-2" data-i18n="landing.recentData">{t("landing.recentData")}</h3>
              <p className="text-gray-600 text-sm" data-i18n="landing.stayAheadDesc">{t("landing.stayAheadDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold mb-16" data-i18n="landing.whyChoose">{t("landing.whyChoose")}</h2>

          <div className="relative">
            <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-1 bg-indigo-200"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  1
                </div>
                <h3 className="font-semibold mb-2" data-i18n="landing.boostSales">{t("landing.boostSales")}</h3>
                <p className="text-gray-600 text-sm" data-i18n="landing.boostSalesDesc">{t("landing.boostSalesDesc")}</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  2
                </div>
                <h3 className="font-semibold mb-2" data-i18n="landing.saveTime">{t("landing.saveTime")}</h3>
                <p className="text-gray-600 text-sm" data-i18n="landing.saveTimeDesc">{t("landing.saveTimeDesc")}</p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  3
                </div>
                <h3 className="font-semibold mb-2" data-i18n="landing.stayAhead">{t("landing.stayAhead")}</h3>
                <p className="text-gray-600 text-sm" data-i18n="landing.stayAheadDesc">{t("landing.stayAheadDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

   
    <Footer />
  </div>
);

}
