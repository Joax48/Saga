'use client';

/**
 * Component for rendering sorting controls with options for sorting by different fields and sort orders.
 * It is designed to be reusable and customizable for different sorting needs.
 */
export interface SortControlOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Props for the SortControls component, allowing customization of sorting options, labels, and change handlers.
 */
export interface SortControlsProps<SortBy extends string, SortOrder extends string> {
  label?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  sortByOptions: SortControlOption<SortBy>[];
  sortOrderOptions: SortControlOption<SortOrder>[];
  onSortByChange: (value: SortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
  className?: string;
}

export function SortControls<SortBy extends string, SortOrder extends string>({
  label = 'Ordenar por',
  sortBy,
  sortOrder,
  sortByOptions,
  sortOrderOptions,
  onSortByChange,
  onSortOrderChange,
  className = '',
}: SortControlsProps<SortBy, SortOrder>) {
  return (
    <div
      className={`flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3 ${className}`.trim()}
    >
      <span className="text-sm" style={{ color: 'var(--color-text-neutral-secondary)' }}>
        {label}
      </span>

      {/* Selects share their own row so they size to their content instead of
          stretching to the full width on mobile (flex-col stretch). */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as SortBy)}
          className="text-sm border rounded px-2 py-1"
          style={{ color: 'var(--color-text-neutral-secondary)' }}
          aria-label={label}
        >
          {sortByOptions.map((option) => (
            <option key={option.value} value={option.value} className="text-sm">
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(event) => onSortOrderChange(event.target.value as SortOrder)}
          className="text-sm border rounded px-2 py-1"
          style={{ color: 'var(--color-text-neutral-secondary)' }}
          aria-label="Orden de ordenamiento"
        >
          {sortOrderOptions.map((option) => (
            <option key={option.value} value={option.value} className="text-sm">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
