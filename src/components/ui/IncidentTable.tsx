import type { IncidentCardProps, IncidentType } from "./IncidentCard";
import { getLoggedUser,} from "../../utils/storage";

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
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Incidents</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-xs sm:text-sm">
            <tr className="text-gray-700 border-b border-gray-300">
              <th className="px-3 sm:px-4 py-3 w-24 sm:w-32 border-r border-gray-200">Type</th>
              <th className="px-3 sm:px-4 py-3 border-r border-gray-200">Description</th>
              <th className="px-3 sm:px-4 py-3 w-36 sm:w-48 border-r border-gray-200 hidden md:table-cell">Location</th>
              <th className="px-3 sm:px-4 py-3 w-28 sm:w-32 border-r border-gray-200 hidden lg:table-cell">Date</th>
              <th className="px-3 sm:px-4 py-3 w-32 sm:w-36 border-r border-gray-200 text-center hidden md:table-cell">
                Status
              </th>
              <th className="px-3 sm:px-4 py-3 w-28 sm:w-32 border-r border-gray-200 text-center">
                Sold
              </th>
              <th className="px-3 sm:px-4 py-3 w-28 sm:w-32 border-r border-gray-200 text-center">
                Discount
              </th>
              <th className="px-3 sm:px-4 py-3 w-28 sm:w-32 text-center">Action</th>
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
                  {/* Type */}
                  <td className="px-3 sm:px-4 py-3 border-r border-gray-200 align-top">
                    <span
                      className={`${tagColors[incident.type]} px-2 py-1 rounded-full text-xs font-semibold`}
                    >
                      {incident.type}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-3 sm:px-4 py-3 text-gray-900 max-w-[220px] sm:max-w-[250px] border-r border-gray-200 relative overflow-visible">
                    <div className="group relative">
                      <span className="block truncate whitespace-nowrap cursor-help text-xs sm:text-sm">
                        {incident.title}
                      </span>
                      <div
                        className={`absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 
                          left-1/2 -translate-x-1/2 z-50 max-w-sm whitespace-normal shadow-lg
                          ${
                            index >= incidents.length - 2
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                      >
                        {incident.title}
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-3 sm:px-4 py-3 text-gray-900 max-w-[200px] truncate whitespace-nowrap border-r border-gray-200 hidden md:table-cell">
                    {incident.location}
                  </td>

                  {/* Date */}
                  <td className="px-3 sm:px-4 py-3 text-gray-900 border-r border-gray-200 hidden lg:table-cell">
                    {incident.date}
                  </td>

                  {/* Status (Verified / Incomplete) */}
                  <td className="px-3 sm:px-4 py-3 text-center border-r border-gray-200 hidden md:table-cell">
                    {incident.verified ? (
                      <span className="flex items-center justify-center gap-1 text-green-600 text-sm font-semibold">
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
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-yellow-500 text-sm font-semibold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 10A8 8 0 11.001 10 8 8 0 0118 10zM9 4h2v6H9V4zm0 8h2v2H9v-2z" />
                        </svg>
                        Incomplete
                      </span>
                    )}
                  </td>

                  {/* Sold */}
                  <td className="px-3 sm:px-4 py-3 text-center border-r border-gray-200">
                    {incident.sold ? (
                      <span className="flex items-center justify-center gap-1 text-red-600 text-sm font-semibold">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2H9v-2zm0-8h2v6H9V5z" />
                        </svg>
                        Sold
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-3 sm:px-4 py-3 text-center border-r border-gray-200">
                    {incident.sold ? (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                        50% OFF
                      </span>
                    ) : incident.is_promo ? (
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {Math.round((incident.promo_percent ?? 0.4) * 100)}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                      {/* Action */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        {/* Botón Add/Remove from Cart */}
                        <button
                          className={`${incident.disabled ? "text-gray-400 cursor-not-allowed" : "text-indigo-600 hover:underline"} font-medium block mx-auto`}
                          disabled={!!incident.disabled}
                          title={incident.disabled ? (incident.disabledReason || "Selection disabled") : undefined}
                          onClick={
                            incident.checked
                              ? incident.onRemoveFromCart
                              : incident.onAddToCart
                          }
                        >
                          {incident.checked ? "Remove" : "Add to cart"}
                        </button>

                        {/* 🔹 Botón Remove Promo (igual al de IncidentCard) */}
                        {getLoggedUser()?.role === "admin" && incident.is_promo && (
                          <button
                            onClick={() => {
                              const confirmRemove = window.confirm(
                                "Are you sure you want to remove the 40% discount promotion?"
                              );
                              if (confirmRemove) {
                                incident.onRemovePromotion?.(incident.id);
                              }
                            }}
                            className="mt-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                          >
                            Remove Promo
                          </button>
                        )}
                      </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
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
