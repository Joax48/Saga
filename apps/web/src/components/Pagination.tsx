'use client';

/**
 * Props for the Pagination component.
 */
type PaginationProps = {
  /** Current active page */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Callback triggered when page changes */
  onPageChange: (page: number) => void;
};

/**
 * Pagination component.
 *
 * Displays navigation controls for paginated content, including:
 * - First page
 * - Previous page
 * - Page numbers
 * - Next page
 * - Last page
 *
 * Uses a dynamic range of visible pages around the current page.
 *
 * @example
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   onPageChange={(page) => console.log(page)}
 * />
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  /**
   * Calculates visible page numbers around the current page.
   */
  const getVisiblePages = () => {
    const half = 1;
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + 2);

    if (end - start < 2) start = Math.max(1, end - 2);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="Paginación"
      className="
        flex w-full flex-wrap items-center justify-center gap-1.5 pt-2 pb-16 text-sm
        sm:gap-3
        text-[var(--color-text-neutral-secondary)]
      "
    >
      {/* First */}
      <button
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        aria-label="Primera página"
        className="
          flex items-center gap-1 transition-colors
          disabled:opacity-30
          hover:text-[var(--color-text-brand-primary)]
        "
      >
        <span>«</span> <span className="hidden sm:inline">Primero</span>
      </button>

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
        className="
          flex items-center gap-1 transition-colors
          disabled:opacity-30
          hover:text-[var(--color-text-brand-primary)]
        "
      >
        <span>‹</span> <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors
            ${
              currentPage === page
                ? 'bg-[var(--color-bg-brand-primary)] text-[var(--color-text-neutral-inverse-primary)]'
                : 'hover:text-[var(--color-text-brand-primary)]'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Página siguiente"
        className="
          flex items-center gap-1 transition-colors
          disabled:opacity-30
          hover:text-[var(--color-text-brand-primary)]
        "
      >
        <span className="hidden sm:inline">Siguiente</span> <span>›</span>
      </button>

      {/* Last */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        aria-label="Última página"
        className="
          flex items-center gap-1 transition-colors
          disabled:opacity-30
          hover:text-[var(--color-text-brand-primary)]
        "
      >
        <span className="hidden sm:inline">Último</span> <span>»</span>
      </button>
    </nav>
  );
}
