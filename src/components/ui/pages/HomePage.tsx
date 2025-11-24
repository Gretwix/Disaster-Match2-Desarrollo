/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import apiUrl from "../../../utils/api";
import { getLoggedUser, purchasedIncidentsKey } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import { notifyError } from "../../../utils/notify";

import Header from "../Header";
import Footer from "../Footer";
import IncidentCard, { type IncidentCardProps } from "../IncidentCard";
import { IncidentTable } from "../IncidentTable";
import Pagination from "../Pagination";

// URL base de la API
const API_URL = `${apiUrl("/Leads/List")}`;

// items por página
const itemsPerPage = 9;

// Tipos locales
type Lead = {
  id: number;
  lead_state?: string;
  city?: string;
  full_address?: string;
  lead_date?: string | null;
  event_type?: string | null;
  details?: string | null;
  home_owner_email?: string | null;
  home_owner_phone?: string | null;
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

// Componente principal
export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loggedUser = getLoggedUser();

  // Estados del carrito
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Estados de interfaz
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Datos principales
  const [leads, setLeads] = useState<Lead[]>([]);
  const [eligible, setEligible] = useState<Lead[]>([]); // leads elegibles para promoción
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);

  // Estados de carga y paginación
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [eligPage, setEligPage] = useState(1);

  // Obtener precio de un lead teniendo en cuenta promoción y compras
  const getPrice = (lead: Lead) => {
    // Precio base según verificado
    let basePrice = lead.home_owner_email && lead.home_owner_phone ? 200 : 100;

    // Si ya fue comprado, aplicar 50 por ciento
    if ((lead.times_purchased ?? 0) > 0) {
      basePrice *= 0.5;
    }

    // Si tiene promoción activa y no ha sido comprado, aplicar descuento
    const promoActive = lead.is_promo === true && (lead.times_purchased ?? 0) === 0;
    if (promoActive) {
      const pct = Number(lead.promo_percent ?? 0.4);
      basePrice = Math.round(basePrice * (1 - pct));
    }

    return Math.round(basePrice);
  };

  // Añadir al carrito
  const addToCart = (lead: Lead) => {
    // Temporary rule: allow at most one lead per user overall and per cart
    if (hasPurchased) {
      notifyError("For now, each user can only purchase one lead.");
      return;
    }
    if (cart.length >= 1) {
      notifyError("Only one lead can be purchased at a time. Remove the other item first.");
      return;
    }
    const price = getPrice(lead);
    setCart((prev) => {
      if (prev.some((i) => i.id === lead.id)) return prev;
      const next = [...prev, { id: lead.id, title: lead.event_type ?? "Lead", price, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  // Quitar del carrito
  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  // Sincronizar carrito con localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Actualizar títulos/precios del carrito cuando cambian los leads
  useEffect(() => {
    if (!leads.length || !cart.length) return;
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const lead = leads.find((l) => l.id === item.id);
        if (lead) {
          const newPrice = getPrice(lead);
          const newTitle = lead.event_type ?? item.title;
          if (newPrice !== item.price || newTitle !== item.title) {
            changed = true;
            return { ...item, price: newPrice, title: newTitle };
          }
        }
        return item;
      });
      return changed ? next : prev;
    });
  }, [leads]);

  // Cargar leads, compras y elegibles (si admin)
  useEffect(() => {
    const fetchLeadsAndPurchases = async () => {
      setLoading(true);
      try {
        // Cargar leads
        const resLeads = await fetch(API_URL);
        const dataLeads: Lead[] = await resLeads.json();
        setLeads(Array.isArray(dataLeads) ? dataLeads : []);

        // Cargar compras para determinar si el usuario ya compró algún lead
        const resPurchases = await fetch(apiUrl("/Purchase/List"));
        const purchases = await resPurchases.json();
        // Determinar si el usuario actual ya realizó alguna compra con leads
        const currentUserId = (loggedUser as any)?.id ?? (loggedUser as any)?.ID;
        const userHasPurchased = Array.isArray(purchases)
          ? purchases.some(
              (p: any) =>
                (p.user_id === currentUserId || p.userId === currentUserId) &&
                Array.isArray(p.leads) &&
                p.leads.length > 0
            )
          : false;
        setHasPurchased(!!userHasPurchased);

        // Si es admin, cargar leads elegibles para promoción
        if (loggedUser?.role === "admin") {
          try {
            const resEligible = await fetch(apiUrl("/Leads/EligibleLeadsForPromotion"));
            const dataEligible = await resEligible.json();
            setEligible(Array.isArray(dataEligible) ? dataEligible : []);
          } catch (err) {
            console.error("Error cargando leads elegibles:", err);
            setEligible([]);
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsAndPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar promoción a un lead
const applyPromotion = async (id: number) => {
  try {
    console.log("Applying promotion to lead ID:", id);

    // Pedir porcentaje al admin
    const input = prompt("Enter promotion percentage (example: 0.2 = 20%)");

    const promoPercent = Number(input);

    if (isNaN(promoPercent) || promoPercent <= 0 || promoPercent >= 1) {
      alert("Invalid percentage. Use decimals, e.g., 0.2 = 20%");
      return;
    }

    const res = await fetch(apiUrl("/Leads/ApplyPromotionToLead"), {

      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, promoPercent }),
    });

    const text = await res.text();

    if (!res.ok) {
      alert(text || "Error applying promotion");
      console.error(" Promotion failed:", text);
      return;
    }

    console.log(" Promotion applied:", text);

    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              is_promo: true,
              promo_percent: promoPercent,
            }
          : l
      )
    );

    setEligible((prev) => prev.filter((l) => l.id !== id));

    alert("Promotion successfully applied!");
  } catch (e) {
    console.error(" Error applying promotion:", e);
    alert("Failed to apply the promotion.");
  }
};


//Eliminar promoción de un lead
const removePromotion = async (id: number) => {
  try {
    console.log("Removing promotion from lead ID:", id);

    const res = await fetch(apiUrl("/Leads/RemovePromotionFromLead"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const text = await res.text();

    if (!res.ok) {
      alert(text || "Error removing promotion");
      console.error(" Promotion removal failed:", text);
      return;
    }

    console.log(" Promotion removed:", text);

    // Actualiza el lead en la lista principal
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, is_promo: false, promo_percent: null, promo_start_date: null }
          : l
      )
    );

    alert("Promotion successfully removed!");
  } catch (e) {
    console.error("Error removing promotion:", e);
    alert("Failed to remove promotion.");
  }
};



  // Filtrado, búsqueda y ordenamiento
  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    return [...leads]
      .filter((lead) => {
        const leadType = (lead.event_type ?? "other").toLowerCase();
        const matchesFilter = filter === "all" || leadType === filter.toLowerCase();
        const matchesSearch =
          s === "" ||
          Object.values(lead)
            .filter((v) => typeof v === "string")
            .some((v) => v.toLowerCase().includes(s));
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const da = new Date(a.lead_date ?? "").getTime();
        const db = new Date(b.lead_date ?? "").getTime();
        return db - da;
      });
  }, [filter, search, leads]);

  // Paginación principal
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // Paginación para elegibles
  const paginatedEligible = eligible.slice((eligPage - 1) * itemsPerPage, eligPage * itemsPerPage);

  // Mapear a props de IncidentCard
  const incidentProps: IncidentCardProps[] = paginatedLeads.map((lead) => ({
    id: lead.id,
    type: (lead.event_type?.toUpperCase() as "ROBBERY" | "FIRE" | "CRIME" | "OTHER") || "OTHER",
    title: lead.details ?? "",
    location: `${lead.city ?? ""}, ${lead.lead_state ?? ""}`,
    date: lead.lead_date ?? lead.fecha_registro ?? "",
    price: getPrice(lead),
    verified: !!lead.home_owner_email && !!lead.home_owner_phone,
    checked: cart.some((i) => i.id === lead.id),
    onAddToCart: () => addToCart(lead),
    onRemoveFromCart: () => removeFromCart(lead.id),
    onRemovePromotion: (id) => removePromotion(id), 
    sold: (lead.times_purchased ?? 0) > 0,
    is_promo: !!lead.is_promo,
    promo_percent: Number(lead.promo_percent ?? 0.4),
    // Disable selection if user already purchased any lead,
    // or if another different lead is already in cart
    disabled:
      hasPurchased || (!cart.some((i) => i.id === lead.id) && cart.length >= 1),
    disabledReason: hasPurchased
      ? "You already purchased a lead. Limit is one per user for now."
      : cart.length >= 1 && !cart.some((i) => i.id === lead.id)
      ? "Only one lead can be purchased at a time. Remove the current selection first."
      : undefined,
  }));

  // Totales del carrito
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

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
                  <h2 className="text-2xl font-semibold text-gray-800 mb-0 leading-tight">
                    {t("home.availableReports")}
                  </h2>
                  <p className="text-gray-600 leading-snug mt-0">{t("home.browse")}</p>
                  {/* Temporary note about one-lead limit */}
                  <div className="mt-2 text-xs sm:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    {t("home.temporaryLimitNote")}
                  </div>
                </div>

                <div className="w-full md:w-72 max-w-md bg-white border border-gray-300 rounded-lg shadow-sm p-1 text-sm text-gray-700 md:ml-2">
                  <div className="mb-1">
                    <span className="font-semibold text-green-600">{t("home.verifiedLabel")}</span>
                    <span className="ml-1 text-gray-700">{t("home.verifiedDetail")}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold text-yellow-600">{t("home.incompleteLabel")}</span>
                    <span className="ml-1 text-gray-700">{t("home.incompleteDetail")}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-red-600">{t("home.soldLabel")}</span>
                    <span className="ml-1 text-gray-700">{t("home.soldDetail")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promociones para admin */}
            {loggedUser?.role === "admin" && (
              <div className="mb-8">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Eligible Leads for Promotion</h3>
                      <p className="text-sm text-gray-500 mt-1">Automatically generated list of leads that have been unsold for more than 7 days.</p>
                    </div>
                    <span className="text-sm text-gray-600 mt-2 sm:mt-0">Total: {eligible.length}</span>
                  </div>

                  {eligible.length === 0 ? (
                    <p className="text-gray-500 text-sm">No eligible leads available.</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-100 text-xs sm:text-sm">
                            <tr className="text-gray-700 border-b border-gray-300">
                              <th className="px-3 sm:px-4 py-3 w-24 sm:w-32 border-r border-gray-200">Type</th>
                              <th className="px-3 sm:px-4 py-3 border-r border-gray-200">Description</th>
                              <th className="px-3 sm:px-4 py-3 w-40 sm:w-48 border-r border-gray-200 hidden md:table-cell">City / State</th>
                              <th className="px-3 sm:px-4 py-3 w-32 sm:w-40 border-r border-gray-200 hidden lg:table-cell">Registration Date</th>
                              <th className="px-3 sm:px-4 py-3 w-32 sm:w-40 text-center">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {paginatedEligible.map((lead, index) => (
                              <tr key={lead.id} className={`hover:bg-gray-50 transition-colors border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                                <td className="px-3 sm:px-4 py-3 border-r border-gray-200 text-gray-900 align-top">{lead.event_type}</td>
                                <td className="px-3 sm:px-4 py-3 text-gray-900 max-w-[220px] sm:max-w-[250px] border-r border-gray-200 relative overflow-visible">
                                  <div className="group relative">
                                    <span className="block truncate whitespace-nowrap cursor-help text-xs sm:text-sm">{lead.details || "No description available"}</span>
                                    <div className={`absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 z-50 max-w-sm whitespace-normal shadow-lg ${index >= eligible.length - 2 ? "bottom-full mb-2" : "top-full mt-2"}`}>
                                      {lead.details || "No description available"}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-gray-900 truncate whitespace-nowrap border-r border-gray-200 hidden md:table-cell">{lead.city}, {lead.lead_state}</td>
                                <td className="px-3 sm:px-4 py-3 text-gray-900 border-r border-gray-200 hidden lg:table-cell">{new Date(lead.fecha_registro ?? lead.lead_date ?? "").toLocaleDateString()}</td>
                                <td className="px-3 sm:px-4 py-3 text-center">
                                  <button
                                    className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                                    onClick={() => {
                                      const confirmApply = window.confirm(
                                        "Are you sure you want to apply a promotion to this lead?"
                                      );
                                      if (confirmApply) {
                                        applyPromotion(lead.id);
                                      }
                                    }}
                                  >
                                     Apply Promotion
                                  </button>

                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4">
                        <Pagination currentPage={eligPage} totalItems={eligible.length} itemsPerPage={itemsPerPage} onPageChange={setEligPage} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="w-full md:w-1/2">
                  <input type="text" placeholder={t("home.searchPlaceholder")} className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>

                <div className="flex items-center gap-2 w-full md:w-1/2">
                  <select className="flex-1 pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
                    <option value="all">{t("home.allIncidentTypes")}</option>
                    <option value="robbery">Robbery</option>
                    <option value="fire">Fire</option>
                    <option value="crime">Crime</option>
                    <option value="other">Other</option>
                  </select>

                  <div className="flex flex-wrap sm:inline-flex justify-center sm:justify-start w-full sm:w-auto rounded-xl border border-gray-300 overflow-hidden text-sm shadow-sm gap-2 sm:gap-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex-1 sm:flex-none px-4 py-2 font-semibold text-sm transition-all duration-200 ${
                      viewMode === "cards"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t("home.cards")}
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex-1 sm:flex-none px-4 py-2 font-semibold text-sm transition-all duration-200 ${
                      viewMode === "table"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t("home.table")}
                  </button>
                </div>


                </div>
              </div>
            </div>

            {/* Grid o tabla de leads */}
            {loading ? (
              <p className="text-center text-gray-500">{t("home.loadingIncidents")}</p>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {incidentProps.map((incident) => (
                  <IncidentCard key={incident.id} {...incident} />
                ))}
              </div>
            ) : (
              <IncidentTable incidents={incidentProps} />
            )}

            {/* Paginación principal */}
            <Pagination currentPage={page} totalItems={filteredLeads.length} itemsPerPage={itemsPerPage} onPageChange={setPage} />

            {/* Barra inferior con resumen y checkout */}
            <div className="mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">{t("home.incidentsSelected", { count: cart.length })}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-semibold text-gray-900">{t("home.total")} {formatCurrency(total)}</span>
                    <button
                      type="button"
                      className="w-full sm:w-auto px-8 py-3 text-base sm:text-lg bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cart.length === 0 || cart.length > 1 || hasPurchased}
                      onClick={() => {
                        const user = getLoggedUser();
                        if (!user?.username) {
                          alert('No user logged in');
                          return;
                        }
                        if (hasPurchased) {
                          notifyError('You already purchased a lead. Limit is one per user for now.');
                          return;
                        }
                        if (cart.length > 1) {
                          notifyError('Only one lead can be purchased at a time. Remove extra items.');
                          return;
                        }
                        const key = purchasedIncidentsKey(user.username);
                        const prev = JSON.parse(localStorage.getItem(key) || '[]');
                        const updated = [...prev, ...cart.filter((c) => !prev.some((p: any) => p.id === c.id))];
                        localStorage.setItem(key, JSON.stringify(updated));
                        navigate({ to: '/Cart' });
                      }}
                    >
                      {t('home.proceedToCheckout')}
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