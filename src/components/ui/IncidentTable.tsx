import type { IncidentCardProps, IncidentType } from "./IncidentCard";

const tagColors: Record<IncidentType, string> = {
  ROBBERY: "bg-red-100 text-red-700",
  FIRE: "bg-orange-100 text-orange-800",
  CRIME: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-green-100 text-green-700",
};

type IncidentTableProps = {
  incidents: IncidentCardProps[];
};

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Incidents</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm table-fixed border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr className="text-gray-700 border-b border-gray-300">
              <th className="px-4 py-3 w-32 border-r border-gray-200">Type</th>
              <th className="px-4 py-3 w-64 border-r border-gray-200">Description</th>
              <th className="px-4 py-3 w-48 border-r border-gray-200">Location</th>
              <th className="px-4 py-3 w-32 border-r border-gray-200">Date</th>
              <th className="px-4 py-3 w-32 border-r border-gray-200">Status</th>
              <th className="px-4 py-3 w-32 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length > 0 ? (
              incidents.map((incident, index) => (
                <tr
                  key={incident.id}
                  className={`hover:bg-gray-50 transition-colors border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  {/* Tipo */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span
                      className={`${tagColors[incident.type]} px-2 py-1 rounded-full text-xs font-semibold`}
                    >
                      {incident.type}
                    </span>
                  </td>

                  {/* Descripción con tooltip dinámico */}
                  <td className="px-4 py-3 text-gray-900 max-w-[250px] border-r border-gray-200 relative overflow-visible">
                    <div className="group relative">
                      <span className="block truncate whitespace-nowrap cursor-help">
                        {incident.title}
                      </span>
                      {/* Tooltip */}
                      <div
                        className={`absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 
                          left-1/2 -translate-x-1/2 z-50 max-w-sm whitespace-normal shadow-lg
                          ${
                            index >= incidents.length - 2
                              ? "bottom-full mb-2" // si es de las últimas filas -> hacia arriba
                              : "top-full mt-2"   // si no, hacia abajo
                          }`}
                      >
                        {incident.title}
                      </div>
                    </div>
                  </td>

                  {/* Ubicación */}
                  <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate whitespace-nowrap border-r border-gray-200">
                    {incident.location}
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3 text-gray-900 border-r border-gray-200">
                    {incident.date}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    {incident.verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        ✅ Verified
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center gap-1">
                        ⚠️ Incomplete
                      </span>
                    )}
                  </td>

                  {/* Acción */}
                  <td className="px-4 py-3 text-center">
                    <button
                      className="text-indigo-600 hover:underline font-medium"
                      onClick={
                        incident.checked
                          ? incident.onRemoveFromCart
                          : incident.onAddToCart
                      }
                    >
                      {incident.checked ? "Remove" : "Add to cart"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-3 text-center text-gray-500"
                >
                  No incidents available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
