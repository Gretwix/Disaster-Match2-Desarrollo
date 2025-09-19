import { Home, User, Users, BarChart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLoggedUser } from "../../../utils/storage";

export default function AdminReports() {
  const loggedUser = getLoggedUser();

  // Estados para estadísticas
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  // Fetch total de usuarios
  useEffect(() => {
    fetch("https://localhost:7044/Users/TotalUsers")
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.totalUsers))
      .catch((err) => console.error("Error fetching total users:", err));
  }, []);

  // Fetch historial (usuarios + compras)
  useEffect(() => {
    fetch("https://localhost:7044/Users/History")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  // Fetch estadísticas de ventas
  useEffect(() => {
    fetch("https://localhost:7044/Purchase/Stats")
      .then((res) => res.json())
      .then((data) => {
        setTotalSales(data.totalSales);
        setTotalRevenue(data.totalRevenue);
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

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
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">DisasterMatch</span>
                </Link>

                <Link to="/Profile" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </Link>

                <Link
                  to="/AdminUsers"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{ className: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" }}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </Link>

                <Link
                  to="/AdminReports"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{ className: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200" }}
                >
                  <BarChart className="h-5 w-5" />
                  <span className="font-medium">Reports</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900">Reports Overview</h1>

              {/* Tarjetas de estadísticas */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Total Users</h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">
                    {totalUsers !== null ? totalUsers : "Loading..."}
                  </p>
                  <p className="text-sm text-gray-500">Registered users</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Purchases</h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">
                    {totalSales !== null ? totalSales : "Loading..."}
                  </p>
                  <p className="text-sm text-gray-500">Completed orders</p>
                </div>

                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800">Revenue</h2>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {totalRevenue !== null ? `$${totalRevenue.toFixed(2)}` : "Loading..."}
                  </p>
                  <p className="text-sm text-gray-500">Total earnings</p>
                </div>
              </div>

              {/* Tabla de historial */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
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
                      {history.length > 0 ? (
                        history.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-900">{item.event}</td>
                            <td className="px-4 py-3 text-gray-900">{item.user}</td>
                            <td className={`px-4 py-3 ${ item.event === "Purchase" ? "text-green-600 font-semibold" : "text-gray-900" }`}>{item.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                            No activity yet
                          </td>
                        </tr>
                      )}
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
