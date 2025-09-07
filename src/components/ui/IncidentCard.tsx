
// Componente reutilizable para mostrar la información visual de un incidente
// Compatible con lógica de carrito (agregar/quitar elementos).

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
  checked?: boolean; // Valor booleano que determina si ya está en el carrito.
  onAddToCart: () => void; // Función que se ejecuta al agregar al carrito.
  onRemoveFromCart: () => void; // Función que se ejecuta al quitar del carrito.
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
  type,
  title,
  location,
  date,
  verified,
  checked = false,
  onAddToCart,
  onRemoveFromCart,
}: IncidentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6 flex flex-col gap-2">

        {/* Fila superior: tipo de incidente y checkbox de selección */}
        <div className="flex justify-between items-start">
          <span className={`${tagColors[type]} px-3 py-1 rounded-full text-xs font-semibold`}>
            {type}
          </span>

          {/* Checkbox para marcar como seleccionado en el carrito */}
          <input
            type="checkbox"
            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
            checked={checked}
            onChange={(e) => (e.target.checked ? onAddToCart() : onRemoveFromCart())}
          />
        </div>

        {/* Título del incidente */}
        <h3 className="mt-3 text-lg font-medium text-gray-800">{title}</h3>

        {/* Ubicación del incidente */}
        <p className="text-sm text-gray-500">{location}</p>

       {/* Fecha con ícono de calendario */}
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

{/* Estado verificado + botón, alineados en la misma fila */}
<div className="mt-4 flex justify-between items-center">
  <div className="flex items-center gap-1">
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
    <span className="text-xs">{verified ? "Verified" : "Incomplete"}</span>
  </div>

  <button
    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
    onClick={checked ? onRemoveFromCart : onAddToCart}
  >
    {checked ? "Remove" : "Add to cart"}
  </button>
</div>


      </div>
    </div>
  );
}
