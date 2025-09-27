import { useEffect, useMemo, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Header from "../Header";
import IncidentCard from "../IncidentCard";
import Pagination from "../Pagination";
import Footer from "../Footer";
import { getLoggedUser, purchasedIncidentsKey } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import { useNavigate } from "@tanstack/react-router";

// URL base de tu API (ajusta el puerto al que corre tu backend en VS 2022)
const API_URL = "https://localhost:7044/Leads/List";

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
};

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

export default function HomePage() {
  const navigate = useNavigate();

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

  // Constantes
  const itemsPerPage = 9;

  // Cargar datos del backend y compras del usuario
  useEffect(() => {
    const fetchLeadsAndPurchases = async () => {
      try {
        // Cargar leads
        const resLeads = await fetch(API_URL);
        const dataLeads: Lead[] = await resLeads.json();
        setLeads(dataLeads);

        // Cargar compras (global) y ocultar todos los leads ya comprados
        const resPurchases = await fetch("https://localhost:7044/Purchase/List");
        const purchases = await resPurchases.json();
        let allLeadIds: number[] = [];
        for (const purchase of purchases) {
          if (purchase.leads && Array.isArray(purchase.leads)) {
            allLeadIds = allLeadIds.concat(
              purchase.leads.map((l: any) => l.lead_id ?? l.leadId)
            );
          }
        }
        // Quitar duplicados
        setPurchasedLeadIds(Array.from(new Set(allLeadIds.filter((id) => typeof id === "number"))));
      } finally {
        setLoading(false);
      }
    };
    fetchLeadsAndPurchases();
  }, []);

  // Precio según verificado
  const getPrice = (lead: Lead) =>
    lead.home_owner_email && lead.home_owner_phone ? 200 : 100;

  // Carrito
  const addToCart = (lead: Lead) => {
    const price = getPrice(lead);
    setCart((prev) => {
      if (prev.some((i) => i.id === lead.id)) return prev;
      return [
        ...prev,
        { id: lead.id, title: lead.full_address, price, quantity: 1 },
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

  // Filtros + búsqueda + ocultar leads comprados
  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesFilter =
        filter === "all" ||
        lead.event_type.toLowerCase() === filter.toLowerCase();

      // 🔎 búsqueda general en todos los campos string
      const matchesSearch =
        s === "" ||
        Object.values(lead)
          .filter((v) => typeof v === "string")
          .some((v) => v.toLowerCase().includes(s));
      //const notPurchased = !purchasedLeadIds.includes(lead.id);
      return matchesFilter && matchesSearch; //&& notPurchased;
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

  // Render
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header cartCount={cartCount} cartItems={cart} total={total} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Contenedor con altura mínima: viewport - header - footer */}
          <div className="flex flex-col min-h-[calc(100vh-56px-88px)]">
            
            {/* Título con tooltip */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Available Incident Reports
              </h2>
              <div className="text-gray-600 flex items-center gap-2">
                <span>Browse and select incident reports to purchase for your contracting needs.</span>
                {/* Tooltip de aclaración */}
                <div className="relative group">
                  <InformationCircleIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
                  <div className="absolute left-6 top-0 hidden group-hover:block w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-700 z-10">
                    <div className="mb-1">
                      <span className="font-semibold text-green-600">Verified ($200):</span>{" "}
                      Includes full address, phone number and email.
                    </div>
                    <div>
                      <span className="font-semibold text-yellow-600">Incomplete ($100):</span>{" "}
                      Missing one or more key data such as phone, email or address.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    placeholder="Search by city, state, address or details..."
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                  >
                    <option value="all">All Incident Types</option>
                    <option value="robbery">Robbery</option>
                    <option value="fire">Fire</option>
                    <option value="crime">Crime</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <p className="text-center text-gray-500">Loading incidents...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedLeads.map((lead) => {
                  const price = getPrice(lead);
                  const isChecked = cart.some((i) => i.id === lead.id);
                  return (
                    <IncidentCard
                      key={lead.id}
                      id={lead.id}
                      type={(lead.event_type?.toUpperCase() as "ROBBERY" | "FIRE" | "CRIME" | "OTHER") || "OTHER"}
                      title={lead.details}
                      location={`${lead.city}, ${lead.lead_state}`}
                      date={lead.lead_date}
                      price={price}
                      verified={!!lead.home_owner_email && !!lead.home_owner_phone}
                      checked={isChecked}
                      onAddToCart={() => addToCart(lead)}
                      onRemoveFromCart={() => removeFromCart(lead.id)}
                    />
                  );
                })}
              </div>
            )}

            {/* Paginación */}
            <Pagination
              currentPage={page}
              totalItems={filteredLeads.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />

            {/* Barra inferior al fondo del contenido */}
            <div className="mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">
                      {cart.length} incidents selected
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-semibold text-gray-900">
                      Total: {formatCurrency(total)}
                    </span>
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
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>{/* end: min-h calc wrapper */}
        </div>{/* end: max-w wrapper */}
      </main>

      <Footer />
    </div>
  );
}

