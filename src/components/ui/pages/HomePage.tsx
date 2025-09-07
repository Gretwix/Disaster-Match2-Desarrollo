import { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import IncidentCard from "../IncidentCard";
import Pagination from "../Pagination";

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
  // Estados
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Constantes
  const itemsPerPage = 9;

  // Cargar datos del backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(API_URL);
        const data: Lead[] = await res.json();
        setLeads(data);
      } catch (error) {
        console.error("Error al cargar leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
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

  // Filtros + búsqueda
  const filteredLeads = useMemo(() => {
    const s = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesFilter =
        filter === "all" ||
        lead.event_type.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        s === "" ||
        lead.city.toLowerCase().includes(s) ||
        lead.full_address.toLowerCase().includes(s);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, leads]);

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
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} cartItems={cart} total={total} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-31">
        {/* Título */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Available Incident Reports
          </h2>
          <p className="text-gray-600">
            Browse and select incident reports to purchase for your contracting
            needs.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by location..."
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full md:w-1/2">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
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
                  type={
                    (lead.event_type?.toUpperCase() as
                      | "ROBBERY"
                      | "FIRE"
                      | "CRIME"
                      | "OTHER") || "OTHER"
                  }
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

        {/* Barra inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 md:bg-transparent border-t md:border-0 z-10 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">
                  {cart.length} incidents selected
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-900">
                  Total: ${total.toFixed(2)}
                </span>
                <button
                  type="button"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={cart.length === 0}
                  onClick={() => {
                    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
                    if (!loggedUser?.username) {
                      alert("No user logged in");
                      return;
                    }
                    const key = `purchasedIncidents_${loggedUser.username}`;
                    const prev = JSON.parse(localStorage.getItem(key) || "[]");
                    const updated = [...prev, ...cart.filter(c => !prev.some((p: any) => p.id === c.id))];
                    localStorage.setItem(key, JSON.stringify(updated));
                    alert(`Proceeding to checkout: $${total.toFixed(2)}`);
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
