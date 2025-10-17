import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Terms */}
        <div>
          <h3 className="text-white font-semibold mb-2" data-i18n="footer.terms">{t("footer.terms")}</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/TermsOfUse" className="hover:text-white transition" data-i18n="footer.termsOfUse">
                {t("footer.termsOfUse")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-white font-semibold mb-2" data-i18n="footer.help">{t("footer.help")}</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/Faq" className="hover:text-white transition" data-i18n="footer.faq">
                {t("footer.faq")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-2" data-i18n="footer.contact">{t("footer.contact")}</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/ContactForm" className="hover:text-white transition" data-i18n="footer.contactForm">
                {t("footer.contactForm")}
              </Link>
            </li>
            <li>
               <a
                 href="mailto:support@disastermatch.com"
                 className="hover:text-white transition"
               >
                 support@disastermatch.com
               </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom line */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400" data-i18n="footer.copyright">
        {t("footer.copyright", { year: new Date().getFullYear(), name: "Disaster Match" })}
      </div>
    </footer>
  );
}
