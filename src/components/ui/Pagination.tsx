interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
          currentPage === 1
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
        }`}
      >
        ‹
      </button>

      {/* Numbers */}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p as number)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === p
                ? "bg-indigo-600 text-white shadow-md scale-105"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-400"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
          currentPage === totalPages
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400"
        }`}
      >
        ›
      </button>
    </div>
  );
}
