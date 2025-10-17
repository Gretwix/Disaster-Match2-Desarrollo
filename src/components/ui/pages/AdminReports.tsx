import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Home, User, Users, BarChart } from "lucide-react";
import { getLoggedUser } from "../../../utils/storage";
import Pagination from "../Pagination";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../../utils/api";

// ======================= TYPES ========================
type FilterMode = "current" | "all" | "custom";
type DataType = "all" | "purchases" | "users";

export default function AdminReports() {
  const { t } = useTranslation();

  // ========== AUTH ==========
  const loggedUser = getLoggedUser();

  // ========== STATE ==========
  const [filterMode, setFilterMode] = useState<FilterMode>("current");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [dataType, setDataType] = useState<DataType>("all");
  const [salesByDay, setSalesByDay] = useState<{ day: number; total: number }[]>([]);
  const [usersByDay, setUsersByDay] = useState<{ day: number; total: number }[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // ========== EFFECT: DATA FETCH ==========
  useEffect(() => {
    let cancelled = false;

    const safeFetchJson = async <T,>(
      url: string,
      fallback: T,
      onErrorMsg?: string
    ): Promise<{ data: T; ok: boolean }> => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const text = await res.text();
        if (!text) return { data: fallback, ok: false };
        return { data: JSON.parse(text) as T, ok: true };
      } catch (err) {
        console.error(`Fetch failed for ${url}:`, err);
        if (onErrorMsg) toast.error(onErrorMsg);
        return { data: fallback, ok: false };
      }
    };

    const run = async () => {
      if (filterMode === "all") {
        const usersRes = await safeFetchJson<{ totalUsers: number }>(
          `${API_BASE}/Users/TotalUsers`,
          { totalUsers: 0 },
          "Failed to load total users"
        );
        const histRes = await safeFetchJson<any[]>(
          `${API_BASE}/Users/History`,
          [],
          "Failed to load activity history"
        );
        const statsRes = await safeFetchJson<{ totalSales: number; totalRevenue: number }>(
          `${API_BASE}/Purchase/Stats`,
          { totalSales: 0, totalRevenue: 0 },
          "Failed to load stats"
        );

        if (cancelled) return;
        setTotalUsers(usersRes.data.totalUsers ?? 0);
        setHistory(histRes.data ?? []);
        setTotalSales(statsRes.data.totalSales ?? 0);
        setTotalRevenue(statsRes.data.totalRevenue ?? 0);
        setSalesByDay([]);
        setUsersByDay([]);
      } else {
        const now = new Date();
        const y = filterMode === "current" ? now.getFullYear() : year;
        const m = filterMode === "current" ? now.getMonth() + 1 : month;

        const usersMonth = await safeFetchJson<{ totalUsers: number }>(
          `${API_BASE}/Users/TotalUsersByMonth?year=${y}&month=${m}`,
          { totalUsers: 0 }
        );
        const histMonth = await safeFetchJson<any[]>(
          `${API_BASE}/Users/HistoryByMonth?year=${y}&month=${m}`,
          []
        );
        const statsMonth = await safeFetchJson<{ totalSales: number; totalRevenue: number }>(
          `${API_BASE}/Purchase/StatsByMonth?year=${y}&month=${m}`,
          { totalSales: 0, totalRevenue: 0 }
        );
        const salesByDayRes = await safeFetchJson<{ day: number; total: number }[]>(
          `${API_BASE}/Purchase/StatsByDay?year=${y}&month=${m}`,
          []
        );
        const usersByDayRes = await safeFetchJson<{ day: number; total: number }[]>(
          `${API_BASE}/Users/NewUsersByDay?year=${y}&month=${m}`,
          []
        );

        setSalesByDay(salesByDayRes.data ?? []);
        setUsersByDay(usersByDayRes.data ?? []);

        // Si endpoints mensuales fallan (404/empty), intentar endpoints "all time" como respaldo
        const usersAll = usersMonth.ok
          ? usersMonth
          : await safeFetchJson<{ totalUsers: number }>(
              `${API_BASE}/Users/TotalUsers`,
              { totalUsers: 0 }
            );
        const histAll = histMonth.ok
          ? histMonth
          : await safeFetchJson<any[]>(
              `${API_BASE}/Users/History`,
              []
            );
        const statsAll = statsMonth.ok
          ? statsMonth
          : await safeFetchJson<{ totalSales: number; totalRevenue: number }>(
              `${API_BASE}/Purchase/Stats`,
              { totalSales: 0, totalRevenue: 0 }
            );

        if (cancelled) return;
        setTotalUsers(usersAll.data.totalUsers ?? 0);
        setHistory(histAll.data ?? []);
        setTotalSales(statsAll.data.totalSales ?? 0);
        setTotalRevenue(statsAll.data.totalRevenue ?? 0);

        if (!usersMonth.ok && !usersAll.ok) {
          toast.error("Could not load users data");
        }
        if (!histMonth.ok && !histAll.ok) {
          toast.error("Could not load activity data");
        }
        if (!statsMonth.ok && !statsAll.ok) {
          toast.error("Could not load stats data");
        }
      }
      setPage(1);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [filterMode, month, year]);

  // ========== AUTH GUARD ==========
  if (loggedUser?.role !== "admin") {
    toast.error("Access denied: Admins only");
    return <p className="text-center mt-10 text-red-500">Access denied</p>;
  }

  // ========== HELPERS ==========
  const labelFor = (y: number, m: number) =>
    `${new Date(0, m - 1).toLocaleString("en-US", { month: "long" })} ${y}`;

  // ========== FILTERED & PAGINATED DATA ==========
  const filteredHistory = useMemo(() => {
    if (dataType === "purchases") {
      return history.filter(item => item.event === "Purchase");
    }
    if (dataType === "users") {
      return history.filter(
        item =>
          item.event === "New Registration" ||
          item.event === "Register" ||
          item.event === "New User"
      );
    }
    return history;
  }, [history, dataType]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, page]);

  // ========== EXPORT PDF ==========
  const handleExportPDF = () => {
    try {
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
      });

      const reportLabel =
        filterMode === "all"
          ? "All Time"
          : filterMode === "current"
          ? "Current Month"
          : `${new Date(0, month - 1).toLocaleString("en-US", {
              month: "long",
            })} ${year}`;

      const adminName =
        loggedUser?.username || loggedUser?.email || "Administrator";

      const pdf = new jsPDF("p", "mm", "a4");
      const pageHeight = pdf.internal.pageSize.height;

      // ENCABEZADO
      pdf.setFontSize(18);
      pdf.setTextColor(30, 50, 80);
      pdf.text("DisasterMatch - Admin Report", 105, 20, { align: "center" });

      pdf.setFontSize(11);
      pdf.setTextColor(70, 70, 70);
      pdf.text(`Generated by: ${adminName}`, 14, 35);
      pdf.text(`Report Type: ${reportLabel}`, 14, 41);
      pdf.text(`Generated on: ${formattedDate}`, 14, 47);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, 52, 200, 52);

      // RESUMEN DINÁMICO
      pdf.setFontSize(13);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Summary:", 14, 63);

      pdf.setFontSize(11);
      if (dataType === "all") {
        pdf.text(`• Total Users: ${(totalUsers ?? 0).toString()}`, 14, 70);
        pdf.text(`• Total Purchases: ${(totalSales ?? 0).toString()}`, 14, 76);
        pdf.text(`• Total Revenue: $${(totalRevenue ?? 0).toFixed(2)}`, 14, 82);
      } else if (dataType === "purchases") {
        pdf.text(`• Total Purchases: ${(totalSales ?? 0).toString()}`, 14, 70);
        pdf.text(`• Total Revenue: $${(totalRevenue ?? 0).toFixed(2)}`, 14, 76);
      } else if (dataType === "users") {
        pdf.text(`• Total Users: ${(totalUsers ?? 0).toString()}`, 14, 70);
      }

      // TABLA
      pdf.setFontSize(13);
      pdf.text(
        dataType === "purchases"
          ? "Recent Purchases"
          : dataType === "users"
          ? "User Registrations"
          : "Recent Activity",
        14,
        98
      );

      const startY = 104;
      const rowHeight = 8;
      const usableHeight = pageHeight - 35;
      let y = startY;

      const drawTableHeader = () => {
        pdf.setDrawColor(210, 210, 210);
        pdf.setFillColor(235, 235, 235);
        pdf.rect(14, y, 182, rowHeight, "F");
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text("Date", 18, y + 5.5);
        pdf.text("Event", 55, y + 5.5);
        pdf.text("User", 115, y + 5.5);
        pdf.text("Amount", 170, y + 5.5);
        y += rowHeight;
      };

      drawTableHeader();

      const filteredForPDF =
        dataType === "purchases"
          ? history.filter((item) => item.event === "Purchase")
          : dataType === "users"
          ? history.filter((item) => item.event === "New Registration")
          : history;

      if (filteredForPDF.length === 0) {
        pdf.text("No activity found for this filter.", 18, y + 10);
      } else {
        pdf.setFontSize(10);
        pdf.setTextColor(50, 50, 50);

        filteredForPDF.forEach((item, index) => {
          if (y + rowHeight > usableHeight) {
            pdf.addPage();
            y = 20;
            drawTableHeader();
          }

          pdf.setFillColor(
            index % 2 === 0 ? 255 : 245,
            index % 2 === 0 ? 255 : 245,
            index % 2 === 0 ? 255 : 245
          );
          pdf.rect(14, y, 182, rowHeight, "F");
          pdf.setDrawColor(220, 220, 220);
          pdf.rect(14, y, 182, rowHeight);

          let amount = "-";
          if (item.event === "Purchase" && item.amount) {
            const cleanValue = parseFloat(
              item.amount.toString().replace(/[^\d.-]/g, "")
            );
            const normalized =
              cleanValue > 999 ? cleanValue / 100 : cleanValue;
            amount = `$${normalized.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          }

          pdf.text(new Date(item.date).toLocaleDateString(), 18, y + 5.5);
          pdf.text(item.event?.toString() || "-", 55, y + 5.5);
          pdf.text(item.user?.toString() || "-", 115, y + 5.5);
          pdf.text(amount.toString(), 170, y + 5.5);

          y += rowHeight;
        });
      }

      // FOOTER
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, 285, 200, 285);
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text("© DisasterMatch - Internal Admin Report", 105, 292, {
        align: "center",
      });

      // NOMBRE DEL ARCHIVO
      pdf.save(
        `DisasterMatch_Report_${filterMode}_${dataType}_${now.getFullYear()}_${
          now.getMonth() + 1
        }.pdf`
      );

      toast.success("Report exported successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to export PDF");
    }
  };

  const sidebarLinkBase = "flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition";
  const sidebarActiveClass = "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300";

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            {/* ========== SIDEBAR ========== */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 p-5 md:p-6 bg-gray-50/60 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <Link to="/" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <Home className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.disasterMatch">{t("nav.disasterMatch")}</span>
                </Link>
                <Link to="/AdminReports" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <BarChart className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.adminPanel">{t("nav.adminPanel")}</span>
                </Link>
                <Link to="/Profile" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <User className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.profile">{t("nav.profile")}</span>
                </Link>
                <Link to="/AdminUsers" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <Users className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.users">{t("nav.users")}</span>
                </Link>
              </nav>
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <section className="p-6 md:p-8" id="report-content">
              {/* ======= HEADER ======= */}
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900" data-i18n="reports.overview">{t("reports.overview")}</h1>
                <button onClick={handleExportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition" data-i18n="reports.exportPDF">{t("reports.exportPDF")}</button>
              </div>

              {/* ======= FILTER TOOLBAR ======= */}
              <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex gap-2">
                    {(["current", "all", "custom"] as FilterMode[]).map((mode) => (
                      <button key={mode} onClick={() => setFilterMode(mode)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${filterMode === mode ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"}`}>
                        {mode === "current" ? t("reports.currentMonth") : mode === "all" ? t("reports.allTime") : t("reports.customDate")}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap min-w-[150px] text-right">
                    {filterMode === "all" ? t("reports.showing", { label: t("reports.allTime") }) : filterMode === "current" ? t("reports.showing", { label: labelFor(new Date().getFullYear(), new Date().getMonth() + 1) }) : t("reports.showing", { label: labelFor(year, month) })}
                  </span>
                </div>
                {/* Custom Date Controls */}
                {filterMode === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">
                        Month
                      </label>
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString("en-US", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-600 mb-1">
                        Year
                      </label>
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

              {/* ======= SUMMARY CARDS ======= */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800" data-i18n="reports.totalUsers">{t("reports.totalUsers")}</h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{totalUsers !== null ? totalUsers : "Loading..."}</p>
                  <p className="text-sm text-gray-500">Registered users</p>
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800" data-i18n="reports.purchases">{t("reports.purchases")}</h2>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{totalSales !== null ? totalSales : "Loading..."}</p>
                  <p className="text-sm text-gray-500">Completed orders</p>
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                  <h2 className="text-lg font-semibold text-gray-800" data-i18n="reports.revenue">{t("reports.revenue")}</h2>
                  <p className="mt-2 text-3xl font-bold text-green-600">{totalRevenue !== null ? `$${totalRevenue.toFixed(2)}` : "Loading..."}</p>
                  <p className="text-sm text-gray-500">Total earnings</p>
                </div>
              </div>

              {/* ======= CHARTS ======= */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Day */}
                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Purchase Progress
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          name="Purchase"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* New Users by Day */}
                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    New Users Progress
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usersByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ======= ACTIVITY TABLE ======= */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Activity
                  </h2>
                  <div className="flex gap-2">
                    {(["all", "purchases", "users"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDataType(type)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition
                          ${
                            dataType === type
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {type === "all"
                          ? "All Activity"
                          : type === "purchases"
                          ? "Only Purchases"
                          : "Only Users"}
                      </button>
                    ))}
                  </div>
                </div>
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
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {item.event}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {item.user}
                            </td>
                            <td
                              className={`px-4 py-3 ${
                                item.event === "Purchase"
                                  ? "text-green-600 font-semibold"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.amount}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-3 text-center text-gray-500"
                          >
                            {filterMode === "all"
                              ? "No activity yet"
                              : "No activity for this range"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <Pagination
                  currentPage={page}
                  totalItems={filteredHistory.length}
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