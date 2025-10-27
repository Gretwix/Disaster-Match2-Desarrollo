import { useEffect, useMemo, useState } from "react";
import apiUrl from "../../../utils/api";
import Header from "../Header";
import IncidentCard, { type IncidentCardProps } from "../IncidentCard";
import { IncidentTable } from "../IncidentTable";
import Pagination from "../Pagination";
import Footer from "../Footer";
import { getLoggedUser, purchasedIncidentsKey } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

// URL base de tu API
const API_URL = `${apiUrl("/Leads/List")}`;

// Tipado de lo que viene del backend
type Lead = {
  id: number;
  lead_state: string;
  city: string;
  full_address: string;
  lead_date: string;
  event_type: string;
  details: string;
  home_owner_email?: string;
  home_owner_phone?: string;
  sold?: boolean;
  times_purchased?: number;
  is_promo?: boolean | string | number | null;
  promo_percent?: number | string | null;
  promo_start_date?: string | null;
  fecha_registro?: string | null;
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Estados
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [purchasedLeadIds, setPurchasedLeadIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
const [eligible, setEligible] = useState<Lead[]>([]);
const [eligPage, setEligPage] = useState(1);


const loggedUser = getLoggedUser();





const applyPromotion = async (id: number) => {
  try {
    const res = await fetch(apiUrl("/Leads/ApplyPromotionToLead"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, promoPercent: 0.4 }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text || "Error applying promotion");
      return;
    }

    const data = await res.json();
    console.log("✅ Promotion successfully applied:", data);

    // Mark the lead as promoted in the main list
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, is_promo: true, promo_percent: 0.4 } : l
      )
    );

    //  Remove the lead from the eligible list
    setEligible((prev) => prev.filter((l) => l.id !== id));
  } catch (e) {
    console.error("Error applying promotion:", e);
    alert("Failed to apply the promotion.");
  }
};

// Constants
const itemsPerPage = 9;

// Load data from backend and user purchases
useEffect(() => {
  const fetchLeadsAndPurchases = async () => {
    try {
      // Load leads
      const resLeads = await fetch(API_URL);
      const dataLeads: Lead[] = await resLeads.json();
      setLeads(dataLeads);

      // Load global purchases
      const resPurchases = await fetch(apiUrl("/Purchase/List"));
      const purchases = await resPurchases.json();

      let allLeadIds: number[] = [];
      for (const purchase of purchases) {
        if (purchase.leads && Array.isArray(purchase.leads)) {
          allLeadIds = allLeadIds.concat(
            purchase.leads.map((l: any) => l.lead_id ?? l.leadId)
          );
        }
      }

      setPurchasedLeadIds(
        Array.from(new Set(allLeadIds.filter((id) => typeof id === "number")))
      );

      // If admin, also load eligible leads for promotions
      if (loggedUser?.role === "admin") {
        try {
          const resEligible = await fetch(apiUrl("/Leads/EligibleLeadsForPromotion"));
          const dataEligible = await resEligible.json();
          setEligible(Array.isArray(dataEligible) ? dataEligible : []);
        } catch (err) {
          console.error("Error loading eligible leads:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  fetchLeadsAndPurchases();
}, []);



  // Precio según verificado
 // Precio según verificado
const getPrice = (lead: Lead) => {
  let basePrice = lead.home_owner_email && lead.home_owner_phone ? 200 : 100;

  // 🔹 Si el lead ya fue comprado, baja el precio un 50%
  if ((lead.times_purchased ?? 0) > 0) {
    basePrice *= 0.5;
  }

  // 🔹 Si el lead tiene promoción activa (y no ha sido comprado)
  const promoActive = lead.is_promo === true && (lead.times_purchased ?? 0) === 0;
  if (promoActive) {
    const pct = Number(lead.promo_percent ?? 0.4);
    basePrice *= 1 - pct;
  }

  return Math.round(basePrice);
};

  // Carrito
  const addToCart = (lead: Lead) => {
    const price = getPrice(lead);
    setCart((prev) => {
      if (prev.some((i) => i.id === lead.id)) return prev;
      return [
        ...prev,
        { id: lead.id, title: lead.event_type, price, quantity: 1 },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };
  // Sincronizar carrito con localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Migrar títulos del carrito a event_type cuando tengamos leads cargados
  useEffect(() => {
    if (!leads.length || !cart.length) return;
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const lead = leads.find((l) => l.id === item.id);
        if (lead && item.title !== lead.event_type) {
          changed = true;
          return { ...item, title: lead.event_type };
        }
        return item;
      });
      return changed ? next : prev;
    });
  }, [leads]);

  // Filtros + búsqueda y ordenamiento
  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    return [...leads]
      .filter((lead) => {
        const matchesFilter =
          filter === "all" ||
          lead.event_type.toLowerCase() === filter.toLowerCase();

        const matchesSearch =
          s === "" ||
          Object.values(lead)
            .filter((v) => typeof v === "string")
            .some((v) => v.toLowerCase().includes(s));

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        // Ordenar por lead_date de más reciente a más antiguo
        return new Date(b.lead_date).getTime() - new Date(a.lead_date).getTime();
      });
  }, [filter, search, leads, purchasedLeadIds]);

  // Totales
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // Paginación 
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Mapear leads a IncidentCardProps para IncidentTable
  const incidentProps: IncidentCardProps[] = paginatedLeads.map((lead) => ({
    id: lead.id,
    type:
      (lead.event_type?.toUpperCase() as
        | "ROBBERY"
        | "FIRE"
        | "CRIME"
        | "OTHER") || "OTHER",
    title: lead.details,
    location: `${lead.city}, ${lead.lead_state}`,
    date: lead.lead_date,
    price: getPrice(lead),
    verified: !!lead.home_owner_email && !!lead.home_owner_phone,
    checked: cart.some((i) => i.id === lead.id),
    onAddToCart: () => addToCart(lead),
    onRemoveFromCart: () => removeFromCart(lead.id),
    sold: (lead.times_purchased ?? 0) > 0,
    is_promo: !!lead.is_promo,
    promo_percent: Number(lead.promo_percent ?? 0.4),

  }));

  // Render
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header cartCount={cartCount} cartItems={cart} total={total} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col min-h-[calc(100vh-56px-88px)]">
            {/* Título e información */}
            <div className="mb-6">
  <div className="flex flex-col md:flex-row md:items-start gap-0 w-full">
    <div className="flex-1">
      <h2
        className="text-2xl font-semibold text-gray-800 mb-0 leading-tight"
        data-i18n="home.availableReports"
      >
        {t("home.availableReports")}
      </h2>
      <p className="text-gray-600 leading-snug mt-0">
        {t("home.browse")}
      </p>
    </div>

    {/* Cuadro informativo con las etiquetas de estado */}
    <div className="w-full md:w-72 max-w-md bg-white border border-gray-300 rounded-lg shadow-sm p-1 text-sm text-gray-700 md:ml-2">
      <div className="mb-1">
        <span
          className="font-semibold text-green-600"
          data-i18n="home.verifiedLabel"
        >
          {t("home.verifiedLabel")}
        </span>
        <span
          className="ml-1 text-gray-700"
          data-i18n="home.verifiedDetail"
        >
          {t("home.verifiedDetail")}
        </span>
      </div>

      <div className="mb-1">
        <span
          className="font-semibold text-yellow-600"
          data-i18n="home.incompleteLabel"
        >
          {t("home.incompleteLabel")}
        </span>
        <span
          className="ml-1 text-gray-700"
          data-i18n="home.incompleteDetail"
        >
          {t("home.incompleteDetail")}
        </span>
      </div>

      {/* Nuevo estado: Sold */}
      <div>
        <span
          className="font-semibold text-red-600"
          data-i18n="home.soldLabel"
        >
          {t("home.soldLabel")}
        </span>
        <span
          className="ml-1 text-gray-700"
          data-i18n="home.soldDetail"
        >
          {t("home.soldDetail")}
        </span>
      </div>
    </div>
  </div>
</div>


{loggedUser?.role === "admin" && (
  <div className="mb-8">
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Eligible Leads for Promotion (40% OFF)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Automatically generated list of leads that have been unsold for more than 7 days.
          </p>
        </div>
        <span className="text-sm text-gray-600 mt-2 sm:mt-0">
          Total: {eligible.length}
        </span>
      </div>

      {eligible.length === 0 ? (
        <p className="text-gray-500 text-sm">No eligible leads available.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-xs sm:text-sm">
                <tr className="text-gray-700 border-b border-gray-300">
                  <th className="px-3 sm:px-4 py-3 w-24 sm:w-32 border-r border-gray-200">
                    Type
                  </th>
                  <th className="px-3 sm:px-4 py-3 border-r border-gray-200">
                    Description
                  </th>
                  <th className="px-3 sm:px-4 py-3 w-40 sm:w-48 border-r border-gray-200 hidden md:table-cell">
                    City / State
                  </th>
                  <th className="px-3 sm:px-4 py-3 w-32 sm:w-40 border-r border-gray-200 hidden lg:table-cell">
                    Registration Date
                  </th>
                  <th className="px-3 sm:px-4 py-3 w-32 sm:w-40 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {eligible
                  .slice((eligPage - 1) * itemsPerPage, eligPage * itemsPerPage)
                  .map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50 transition-colors border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                      }`}
                    >
                      {/* Type */}
                      <td className="px-3 sm:px-4 py-3 border-r border-gray-200 text-gray-900 align-top">
                        {lead.event_type}
                      </td>

                      {/* Description with tooltip */}
                      <td className="px-3 sm:px-4 py-3 text-gray-900 max-w-[220px] sm:max-w-[250px] border-r border-gray-200 relative overflow-visible">
                        <div className="group relative">
                          <span className="block truncate whitespace-nowrap cursor-help text-xs sm:text-sm">
                            {lead.details || "No description available"}
                          </span>

                          {/* Tooltip */}
                          <div
                            className={`absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 
                              left-1/2 -translate-x-1/2 z-50 max-w-sm whitespace-normal shadow-lg
                              ${
                                index >= eligible.length - 2
                                  ? "bottom-full mb-2"
                                  : "top-full mt-2"
                              }`}
                          >
                            {lead.details || "No description available"}
                          </div>
                        </div>
                      </td>

                      {/* City / State */}
                      <td className="px-3 sm:px-4 py-3 text-gray-900 truncate whitespace-nowrap border-r border-gray-200 hidden md:table-cell">
                        {lead.city}, {lead.lead_state}
                      </td>

                      {/* Registration Date */}
                      <td className="px-3 sm:px-4 py-3 text-gray-900 border-r border-gray-200 hidden lg:table-cell">
                        {new Date(
                          lead.fecha_registro ?? lead.lead_date ?? ""
                        ).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <button
                          className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                          onClick={() => applyPromotion(lead.id)}
                        >
                          Apply 40%
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              currentPage={eligPage}
              totalItems={eligible.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setEligPage}
            />
          </div>
        </>
      )}
    </div>
  </div>
)}




            {/* Filtros */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Input búsqueda */}
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    placeholder={t("home.searchPlaceholder")}
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                {/* Select + Toggle */}
                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <select
                    className="flex-1 pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="all">{t("home.allIncidentTypes")}</option>
                    <option value="robbery">Robbery</option>
                    <option value="fire">Fire</option>
                    <option value="crime">Crime</option>
                    <option value="other">Other</option>
                  </select>
                  {/* Toggle Cards/Table */}
                  <div className="inline-flex rounded-md border border-gray-300 overflow-hidden text-sm">
                    <button onClick={() => setViewMode("cards")} className={`px-3 py-1.5 transition font-medium ${viewMode === "cards" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`} data-i18n="home.cards">
                      {t("home.cards")}
                    </button>
                    <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 transition font-medium ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`} data-i18n="home.table">
                      {t("home.table")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid o Tabla */}
            {loading ? (
              <p className="text-center text-gray-500" data-i18n="home.loadingIncidents">{t("home.loadingIncidents")}</p>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {incidentProps.map((incident) => (
                  <IncidentCard key={incident.id} {...incident} />
                ))}
              </div>
            ) : (
              <IncidentTable incidents={incidentProps} />
            )}

            {/* Paginación */}
            <Pagination currentPage={page} totalItems={filteredLeads.length} itemsPerPage={itemsPerPage} onPageChange={setPage} />

            {/* Barra inferior al fondo del contenido */}
            <div className="mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">{t("home.incidentsSelected", { count: cart.length })}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-semibold text-gray-900">{t("home.total")} {formatCurrency(total)}</span>
                    <button
                      type="button"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cart.length === 0}
                      onClick={() => {
                        const user = getLoggedUser();
                        if (!user?.username) {
                          alert("No user logged in");
                          return;
                        }
                        const key = purchasedIncidentsKey(user.username);
                        const prev = JSON.parse(localStorage.getItem(key) || "[]");
                        const updated = [
                          ...prev,
                          ...cart.filter((c) => !prev.some((p: any) => p.id === c.id)),
                        ];
                        localStorage.setItem(key, JSON.stringify(updated));
                        navigate({ to: "/Cart" });
                      }}
                      data-i18n="home.proceedToCheckout"
                    >
                      {t("home.proceedToCheckout")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}