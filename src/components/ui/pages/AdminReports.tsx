import { Home, User, Users, BarChart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getLoggedUser } from "../../../utils/storage";

export default function AdminReports() {

const loggedUser = getLoggedUser();

if (loggedUser?.role !== "admin") {
  return <p className="text-center mt-10 text-red-500">Access denied</p>;
}

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 p-5 md:p-6 bg-gray-50/60 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                  to="/Profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </Link>

                <Link
                  to="/AdminUsers"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{
                    className:
                      "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </Link>

                <Link
                  to="/AdminReports"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{
                    className:
                      "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <BarChart className="h-5 w-5" />
                  <span className="font-medium">Reports</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Reports Overview
              </h1>

              {/* Tarjetas de estadísticas */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Total Users
                  </h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">120</p>
                  <p className="text-sm text-gray-500">Registered users</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Purchases
                  </h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">45</p>
                  <p className="text-sm text-gray-500">Completed orders</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Revenue
                  </h2>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    $3,200
                  </p>
                  <p className="text-sm text-gray-500">Total earnings</p>
                </div>
              </div>

              {/* Tabla / detalle */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-700">
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white rounded-xl overflow-hidden">
                      <tr className="bg-white">
                        <td className="px-4 py-3 text-gray-900">2025-09-10</td>
                        <td className="px-4 py-3 text-gray-900">
                          New Registration
                        </td>
                        <td className="px-4 py-3 text-gray-900">jeikol21</td>
                        <td className="px-4 py-3 text-gray-900">-</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">2025-09-11</td>
                        <td className="px-4 py-3 text-gray-900">Purchase</td>
                        <td className="px-4 py-3 text-gray-900">andrey</td>
                        <td className="px-4 py-3 text-green-600">$120</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-4 py-3 text-gray-900">2025-09-12</td>
                        <td className="px-4 py-3 text-gray-900">Purchase</td>
                        <td className="px-4 py-3 text-gray-900">mari21</td>
                        <td className="px-4 py-3 text-green-600">$80</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
