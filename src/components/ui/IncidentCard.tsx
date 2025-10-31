import { getLoggedUser,} from "../../utils/storage";


// Definimos tipos estrictos de incidente para mantener consistencia y evitar errores.
export type IncidentType = 'ROBBERY' | 'FIRE' | 'CRIME' | 'OTHER';

// Definimos las props que debe recibir el componente.
// Incluye datos del incidente y funciones para el manejo de carrito.
export type IncidentCardProps = {
  id: number;
  type: IncidentType;
  title: string;
  location: string;
  date: string;
  price: number;
  verified: boolean;
  sold?: boolean; 
  checked?: boolean; // Valor booleano que determina si ya está en el carrito.
  onAddToCart: () => void; // Función que se ejecuta al agregar al carrito.
  onRemoveFromCart: () => void; // Función que se ejecuta al quitar del carrito.
  is_promo?: boolean;
  promo_percent?: number | null;
  onRemovePromotion?: (id: number) => void;
  disabled?: boolean;
  disabledReason?: string;
};

// Asignamos clases de color para los tags según el tipo de incidente.
// Esto permite identificar visualmente el tipo con colores coherentes.
const tagColors: Record<IncidentType, string> = {
  ROBBERY: "bg-red-100 text-red-700",
  FIRE: "bg-orange-100 text-orange-800",
  CRIME: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-green-100 text-green-700",
};

// Componente principal que representa la tarjeta de un incidente.
// Renderiza información textual y permite interacción con checkbox y botón.
export default function IncidentCard({
  id,
  type,
  title,
  location,
  date,
  verified,
  sold = false,
  checked = false,
  onAddToCart,
  onRemoveFromCart,
  onRemovePromotion,
  is_promo,
  promo_percent,
  disabled,
  disabledReason,
}: IncidentCardProps) {
  const loggedUser = getLoggedUser();
  const isDisabled = !!disabled;
  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm overflow-hidden border transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg 
      ${
        is_promo
          ? "border-indigo-400 ring-1 ring-indigo-300 shadow-indigo-100"
          : "border-gray-100"
      }
      ${sold ? "opacity-80" : ""}
    `}
    >
      {/* 🔹 Cinta superior para promociones */}
      {is_promo && (
        <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-indigo-600/90 to-indigo-400/80 text-white text-xs font-semibold text-center py-1 shadow-sm">
           Limited-Time Promotion – {Math.round((promo_percent ?? 0.4) * 100)}% OFF
        </div>
      )}

      <div className="p-6 flex flex-col gap-2 mt-2">
        {/* Tipo de incidente, etiqueta y checkbox */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-1">
            {/* Tipo de incidente */}
            <span
              className={`${tagColors[type]} px-3 py-1 rounded-full text-xs font-semibold`}
            >
              {type}
            </span>

            
          </div>

          {/* Checkbox */}
          <input
            type="checkbox"
            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            checked={checked}
            disabled={isDisabled}
            title={isDisabled ? disabledReason || "Selection disabled" : undefined}
            onChange={(e) =>
              e.target.checked ? onAddToCart() : onRemoveFromCart()
            }
          />
        </div>

        {/* Título */}
        <div className="relative group mt-3">
        <h3 className="text-lg font-medium text-gray-800 truncate cursor-help">
          {title}
        </h3>

        {/* Tooltip visible al pasar el mouse */}
        <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-4 py-2 left-1/2 -translate-x-1/2 top-full mt-1 w-80 shadow-xl z-50">
          {title}
        </div>
      </div>

        {/* Ubicación */}
        <p className="text-sm text-gray-500">{location}</p>

        {/* Fecha */}
        <div className="mt-2 flex items-center text-sm text-gray-500 gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{date}</span>
        </div>

       {/* Estado + Botones */}
      <div className="mt-4 flex justify-between items-center gap-3">
        {/* 🔹 Columna izquierda (estado) */}
        <div className="flex items-center gap-2">
    {/* Verificado / incompleto */}
    {verified ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-green-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-5.293l-3-3a1 1 0 111.414-1.414L9 10.586l4.879-4.879a1 1 0 111.414 1.414l-5.586 5.586a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zM9 4h2v6H9V4zm0 8h2v2H9v-2z" />
      </svg>
    )}
    <span className="text-xs">
      {verified ? "Verified" : "Incomplete"}
    </span>

    {/* Estado sold */}
    {sold && (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold ml-2">
        Sold
      </span>
    )}
  </div>

  {/* 🔹 Botón Remove Promo (centrado) */}
  {loggedUser?.role === "admin" && is_promo && (
    <div className="flex justify-center flex-1">
      <button
        onClick={() => {
          const confirmRemove = window.confirm(
            "Are you sure you want to remove the 40% discount promotion?"
          );
          if (confirmRemove) {
            onRemovePromotion?.(id);
          }
        }}
        className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
      >
        Remove Promo
      </button>
    </div>
  )}

  {/* 🔹 Botón Add to Cart (derecha) */}
  <button
    className={`text-sm font-medium ${isDisabled ? "text-gray-400 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-500"}`}
    disabled={isDisabled}
    title={isDisabled ? disabledReason || "Selection disabled" : undefined}
    onClick={checked ? onRemoveFromCart : onAddToCart}
  >
    {checked ? "Remove" : "Add to cart"}
  </button>
</div>
      </div>
    </div>
  );
}
