export default function Faq() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex justify-center py-12 px-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Frequently Asked Questions (FAQ)
          </h1>
        </header>

        <div className="h-[70vh] overflow-y-auto pr-2 text-gray-700 leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              1. What is Disaster Match?
            </h2>
            <p>
              Disaster Match is a platform that connects people affected by disasters with contractors or professionals who offer their services to assist them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              2. How does the information purchase system work?
            </h2>
            <p>
              When a contractor wants to learn more about a specific incident (for example, a property affected by fire), they can purchase full access to the affected person’s information. This includes contact details, a description of the damage, and the approximate location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              3. Who can register on Disaster Match?
            </h2>
            <p>
              Anyone can register on the platform:
              <br />- Contractors or companies looking to offer their services to affected individuals.
              <br />- Individuals who want to request assistance after a disaster.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              4. Is it safe to purchase information on the platform?
            </h2>
            <p>
              Yes. Disaster Match protects users’ personal data through strong security protocols and only shares information with verified contractors who purchase access to incident details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              5. How can I purchase information about an affected person?
            </h2>
            <p>
              Go to the “Available Incidents” section, select the case you’re interested in, and click “Add to Cart.” The system will display the price in your cart. Once payment is confirmed, you’ll gain full access to the affected person’s details and incident information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              6. What payment methods does Disaster Match accept?
            </h2>
            <p>
              Currently, we accept credit and debit card payments, as well as other electronic payment options depending on the user’s region.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              7. What happens after purchasing the information?
            </h2>
            <p>
              Once the purchase is complete, you’ll be able to view all the details of the incident and the contact information of the affected person to offer your services or coordinate assistance directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              8. Can I modify or delete my account?
            </h2>
            <p>
              Yes. In the “Profile” section, you can update your personal information or request permanent deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              9. What if I have a problem with payment or viewing an incident?
            </h2>
            <p>
              You can contact our support team through the live chat for immediate assistance with any payment or access issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              10. Can I use Disaster Match from my phone?
            </h2>
            <p>
              Yes. Disaster Match is fully compatible with mobile devices and can be accessed through any modern web browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">
              11. How can I search for a specific disaster?
            </h2>
            <p>
              In the “Available Incidents” section, you can use advanced filters to find specific or general cases.
            </p>
            <p className="mt-3">
              Filters allow you to search by disaster type (fire, flood, earthquake, etc.), location, date of the incident, or reported damage level.
            </p>
          </section>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-8 border-t pt-4">
          © {new Date().getFullYear()} DisasterMatch. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
