import { useNavigate } from "@tanstack/react-router";
import { FaFilter, FaDatabase, FaClock } from "react-icons/fa";
import Footer from "../Footer";
export default function LandingPage() {
  const navigate = useNavigate();

  return (
  <div className="min-h-screen grid grid-rows-[1fr_auto] bg-gray-50">
    {/* Contenido principal */}
    <main>
      <section className="bg-gray-50 text-center py-20 px-6">
  <h1 className="text-3xl md:text-4xl font-bold mb-4">
    Unlock more opportunities to win new clients and contracts
  </h1>
  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
    Turn real-time incident reports into qualified leads and grow your business 
    faster with trusted data at your fingertips.
  </p>
  <div className="flex justify-center gap-4">
    <button
      onClick={() => navigate({ to: "/HomePage" })}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
    >
      Start now
    </button>
    <button
      onClick={() => navigate({ to: "/Login" })}
      className="px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
    >
      Register
    </button>
  </div>
</section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold mb-12">
            Benefits for your business
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaFilter />
              </div>
              <h3 className="font-semibold mb-2">Filters by type</h3>
              <p className="text-gray-600 text-sm">
                Select only incidents relevant to your business: fires, thefts,
                crimes, or others.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaDatabase />
              </div>
              <h3 className="font-semibold mb-2">Complete data</h3>
              <p className="text-gray-600 text-sm">
                Access all the contact information you need to reach your
                potential customers.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-3 text-indigo-600 text-3xl">
                <FaClock />
              </div>
              <h3 className="font-semibold mb-2">Recent data</h3>
              <p className="text-gray-600 text-sm">
                Access the latest and most reliable information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold mb-16">
            Why Choose Us?
          </h2>

          <div className="relative">
            <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-1 bg-indigo-200"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  1
                </div>
                <h3 className="font-semibold mb-2">Boost Your Sales</h3>
                <p className="text-gray-600 text-sm">
                  Turn incidents into real business opportunities with qualified
                  leads.
                </p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  2
                </div>
                <h3 className="font-semibold mb-2">Save Time</h3>
                <p className="text-gray-600 text-sm">
                  All the critical information in one place, no more endless
                  searching.
                </p>
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold mb-4 relative z-10">
                  3
                </div>
                <h3 className="font-semibold mb-2">Stay Ahead</h3>
                <p className="text-gray-600 text-sm">
                  Access fresh and reliable data to always stay ahead of the
                  competition.
                </p>
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
