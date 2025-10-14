import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Terms */}
        <div>
          <h3 className="text-white font-semibold mb-2">Terms</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/TermsOfUse" className="hover:text-white transition">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-white font-semibold mb-2">Help</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-white transition">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-2">Contact</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/ContactForm" className="hover:text-white transition">
                Contact Form
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
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © 2025 Disaster Match. All rights reserved.
      </div>
    </footer>
  );
}
