import { Home, User, Users, BarChart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { getLoggedUser } from "../../../utils/storage";
import Pagination from "../Pagination";
import toast, { Toaster } from "react-hot-toast";

type FilterMode = "current" | "all" | "custom";

export default function AdminReports() {
  const loggedUser = getLoggedUser();

  // Estado de filtros y datos
  const [filterMode, setFilterMode] = useState<FilterMode>("current");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch según modo de filtro
  useEffect(() => {
    if (filterMode === "all") {
      fetch("https://localhost:7044/Users/TotalUsers")
        .then(r => r.json())
        .then(d => setTotalUsers(d.totalUsers))
        .catch(err => {
          console.error("Error fetching total users:", err);
          toast.error("Failed to load total users");
        });

      fetch("https://localhost:7044/Users/History")
        .then(r => r.json())
        .then(d => setHistory(d))
        .catch(err => {
          console.error("Error fetching history:", err);
          toast.error("Failed to load activity history");
        });

      fetch("https://localhost:7044/Purchase/Stats")
        .then(r => r.json())
        .then(d => {
          setTotalSales(d.totalSales);
          setTotalRevenue(d.totalRevenue);
        })
        .catch(err => {
          console.error("Error fetching stats:", err);
          toast.error("Failed to load stats");
        });
    } else {
      const now = new Date();
      const y = filterMode === "current" ? now.getFullYear() : year;
      const m = filterMode === "current" ? now.getMonth() + 1 : month;

      fetch(`https://localhost:7044/Users/TotalUsersByMonth?year=${y}&month=${m}`)
        .then(r => r.json())
        .then(d => setTotalUsers(d.totalUsers))
        .catch(err => {
          console.error("Error fetching monthly users:", err);
          toast.error("Failed to load users for selected period");
        });

      fetch(`https://localhost:7044/Users/HistoryByMonth?year=${y}&month=${m}`)
        .then(r => r.json())
        .then(d => setHistory(d))
        .catch(err => {
          console.error("Error fetching monthly history:", err);
          toast.error("Failed to load activity for selected period");
        });

      fetch(`https://localhost:7044/Purchase/StatsByMonth?year=${y}&month=${m}`)
        .then(r => r.json())
        .then(d => {
          setTotalSales(d.totalSales);
          setTotalRevenue(d.totalRevenue);
        })
        .catch(err => {
          console.error("Error fetching monthly stats:", err);
          toast.error("Failed to load stats for selected period");
        });
    }
    setPage(1);
  }, [filterMode, month, year]);

  if (loggedUser?.role !== "admin") {
    toast.error("Access denied: Admins only");
    return <p className="text-center mt-10 text-red-500">Access denied</p>;
  }

  // Helper para mostrar "Sep 2025"
  const labelFor = (y: number, m: number) =>
    `${new Date(0, m - 1).toLocaleString("en-US", { month: "long" })} ${y}`;

  // Historial paginado
  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return history.slice(startIndex, startIndex + itemsPerPage);
  }, [history, page]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
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
                  <span className="font-medium">Dashboard</span>
                </Link>
              </nav>
            </aside>

            {/* Main */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900">Reports Overview</h1>

              {/* Toolbar de filtros */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex gap-2">
                    {(["current", "all", "custom"] as FilterMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFilterMode(mode)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                          ${filterMode === mode
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                      >
                        {mode === "current" ? "Current Month" : mode === "all" ? "All Time" : "Custom Date"}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap min-w-[150px] text-right">
                    {filterMode === "all"
                      ? "Showing: All Time"
                      : filterMode === "current"
                        ? `Showing: ${labelFor(new Date().getFullYear(), new Date().getMonth() + 1)}`
                        : `Selected: ${labelFor(year, month)}`}
                  </span>
                </div>

                {/* Controles solo para Custom */}
                {filterMode === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Month</label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 w-28"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cards */}
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

              {/* Tabla */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm table-fixed">
                    <thead>
                      <tr className="text-gray-700">
                        <th className="px-4 py-3 w-32">Date</th>
                        <th className="px-4 py-3 w-40">Event</th>
                        <th className="px-4 py-3 w-40">User</th>
                        <th className="px-4 py-3 w-32">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white rounded-xl overflow-hidden">
                      {paginatedHistory.length > 0 ? (
                        paginatedHistory.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-900">{item.event}</td>
                            <td className="px-4 py-3 text-gray-900">{item.user}</td>
                            <td className={`px-4 py-3 ${item.event === "Purchase" ? "text-green-600 font-semibold" : "text-gray-900"}`}>
                              {item.amount}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                            {filterMode === "all" ? "No activity yet" : "No activity for this range"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Paginación */}
                <Pagination
                  currentPage={page}
                  totalItems={history.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
