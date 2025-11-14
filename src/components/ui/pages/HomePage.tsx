/* eslint-disable @typescript-eslint/no-unused-vars */
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
import Swal from "sweetalert2";     // ← ← ← AÑADIDO

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
  const [, setPurchasedLeadIds] = useState<number[]>([]);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);

  // Estados de carga y paginación
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [eligPage, setEligPage] = useState(1);

  // Obtener precio de un lead teniendo en cuenta promoción y compras
  const getPrice = (lead: Lead) => {
    let basePrice = lead.home_owner_email && lead.home_owner_phone ? 200 : 100;
    if ((lead.times_purchased ?? 0) > 0) basePrice *= 0.5;
    const promoActive = lead.is_promo === true && (lead.times_purchased ?? 0) === 0;
    if (promoActive) {
      const pct = Number(lead.promo_percent ?? 0.4);
      basePrice = Math.round(basePrice * (1 - pct));
    }
    return Math.round(basePrice);
  };

  // Añadir al carrito
  const addToCart = (lead: Lead) => {
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
        const resLeads = await fetch(API_URL);
        const dataLeads: Lead[] = await resLeads.json();
        setLeads(Array.isArray(dataLeads) ? dataLeads : []);

        const resPurchases = await fetch(apiUrl("/Purchase/List"));
        const purchases = await resPurchases.json();
        let allLeadIds: number[] = [];
        for (const purchase of purchases || []) {
          if (purchase.leads && Array.isArray(purchase.leads)) {
            allLeadIds = allLeadIds.concat(
              purchase.leads.map((l: any) => l.lead_id ?? l.leadId)
            );
          }
        }
        setPurchasedLeadIds(
          Array.from(new Set(allLeadIds.filter((id) => typeof id === "number")))
        );

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

  // Aplicar promoción a un lead usando SweetAlert2
 const applyPromotion = async (id: number) => {
    try {
      const { value: promoPercent } = await Swal.fire({
        title: "Apply Promotion",
        text: "Enter the promotion percentage (0.2 = 20%)",
        input: "number",
        inputAttributes: {
          min: "0.01",
          max: "0.99",
          step: "0.01",
        },
        inputLabel: "Promotion Percentage",
        inputPlaceholder: "Example: 0.20 = 20%",
        showCancelButton: true,
        confirmButtonText: "Apply",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#4F46E5",
        background: "#ffffff",
      });

      if (promoPercent === undefined) return; // cancelled

      const pct = Number(promoPercent);

      if (isNaN(pct) || pct <= 0 || pct >= 1) {
        Swal.fire({
          icon: "error",
          title: "Invalid Percentage",
          text: "Use decimals only, e.g., 0.2 = 20%",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Confirm Promotion",
        text: `Apply a ${pct * 100}% promotion to this lead?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, apply",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#4F46E5",
      });

      if (!result.isConfirmed) return;

      const res = await fetch(apiUrl("/Leads/ApplyPromotionToLead"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, promoPercent: pct }),
      });

      const text = await res.text();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: text || "Error applying promotion",
        });
        return;
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, is_promo: true, promo_percent: pct }
            : l
        )
      );

      setEligible((prev) => prev.filter((l) => l.id !== id));

      Swal.fire({
        icon: "success",
        title: "Promotion Applied",
        text: "The promotion was successfully applied.",
      });

    } catch (e) {
      console.error("Error applying promotion:", e);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to apply the promotion.",
      });
    }
  };


  // Eliminar promoción usando SweetAlert2
  const removePromotion = async (id: number) => {
    try {
      const confirm = await Swal.fire({
        title: "Remove Promotion?",
        text: "Are you sure you want to remove the promotion from this lead?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        background: "#ffffff",
      });

      if (!confirm.isConfirmed) return;

      const res = await fetch(apiUrl("/Leads/RemovePromotionFromLead"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const text = await res.text();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: text || "Error removing promotion",
        });
        return;
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                is_promo: false,
                promo_percent: null,
                promo_start_date: null,
              }
            : l
        )
      );

      Swal.fire({
        icon: "success",
        title: "Promotion Removed",
        text: "The promotion was successfully removed.",
      });

    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove promotion.",
      });
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

          {/* --- HEADER INFO OMITIDO POR ESPACIO, NO MODIFICADO --- */}

          {/* ADMIN PROMOTIONS TABLE */}
          {loggedUser?.role === "admin" && (
            <div className="mb-8">
              <div className="rounded-2xl border bg-gray-50 p-3 sm:p-5">

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Eligible Leads for Promotion
                    </h3>
                    <p className="text-sm text-gray-500">
                      Automatically generated list of leads unsold for +7 days.
                    </p>
                  </div>
                  <span className="text-sm text-gray-600">
                    Total: {eligible.length}
                  </span>
                </div>

                {eligible.length === 0 ? (
                  <p className="text-gray-500 text-sm">No eligible leads.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-xs sm:text-sm">
                          <tr className="text-gray-700 border-b">
                            <th className="px-3 py-3">Type</th>
                            <th className="px-3 py-3">Description</th>
                            <th className="px-3 py-3 hidden md:table-cell">
                              City / State
                            </th>
                            <th className="px-3 py-3 hidden lg:table-cell">
                              Registration Date
                            </th>
                            <th className="px-3 py-3 text-center">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedEligible.map((lead, index) => (
                            <tr key={lead.id} className="border-b">
                              <td className="px-3 py-3">{lead.event_type}</td>
                              <td className="px-3 py-3">{lead.details}</td>
                              <td className="px-3 py-3 hidden md:table-cell">
                                {lead.city}, {lead.lead_state}
                              </td>
                              <td className="px-3 py-3 hidden lg:table-cell">
                                {new Date(
                                  lead.fecha_registro ??
                                    lead.lead_date ??
                                    ""
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-3 text-center">
                                <button
                                  className="px-4 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                                  onClick={async () => {
                                    const confirm = await Swal.fire({
                                      title: "Apply Promotion?",
                                      icon: "question",
                                      text: "Do you want to apply a promotion to this lead?",
                                      showCancelButton: true,
                                      confirmButtonColor: "#4F46E5",
                                    });

                                    if (confirm.isConfirmed) {
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

          {/* SEARCH + FILTERS OMITIDOS, NO MODIFICADOS */}

          {/* LEAD LISTING */}
          {loading ? (
            <p className="text-center text-gray-500">
              {t("home.loadingIncidents")}
            </p>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {incidentProps.map((incident) => (
                <IncidentCard key={incident.id} {...incident} />
              ))}
            </div>
          ) : (
            <IncidentTable incidents={incidentProps} />
          )}

          {/* MAIN PAGINATION */}
          <Pagination
            currentPage={page}
            totalItems={filteredLeads.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />

          {/* CHECKOUT BAR */}
          <div className="mt-8">
            <div className="bg-white p-4 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">

              <span className="text-gray-700 font-medium">
                {t("home.incidentsSelected", { count: cart.length })}
              </span>

              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-900">
                  {t("home.total")} {formatCurrency(total)}
                </span>

                <button
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  disabled={cart.length === 0 || cart.length > 1 || hasPurchased}
                  onClick={() => {
                    const user = getLoggedUser();
                    if (!user?.username) {
                      Swal.fire({
                        icon: "error",
                        title: "No user logged in",
                      });
                      return;
                    }

                    if (hasPurchased) {
                      notifyError("You already purchased a lead.");
                      return;
                    }

                    if (cart.length > 1) {
                      notifyError("Only one lead can be purchased.");
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
                >
                  {t("home.proceedToCheckout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}