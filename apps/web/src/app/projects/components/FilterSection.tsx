'use client';

import { useState } from 'react';

type FilterOption = {
  label: string;
  count: number;
  value: string;
};

type FilterSectionProps = {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggleOption: (value: string) => void;
  initialVisible?: number;
};

export default function FilterSection({
  title,
  options,
  selectedValues,
  onToggleOption,
  initialVisible = 5,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const visibleOptions = showAll ? options : options.slice(0, initialVisible);

  const shouldShowButton = options.length > initialVisible;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-3 border-[var(--color-gray-800)]">
        <h3 className="text-body-lg text-[var(--color-text-neutral-secondary)] font-normal">
          {title}
        </h3>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? `Ocultar ${title}` : `Mostrar ${title}`}
          className="leading-none text-[var(--color-icon-neutral-secondary)]"
          style={{ fontSize: 'var(--text-h4)' }}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <>
          <div className="space-y-3">
            {visibleOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-3 cursor-pointer text-[var(--color-text-neutral-secondary)]"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggleOption(option.value)}
                  className="mt-1 h-5 w-5 cursor-pointer appearance-none rounded-[var(--radius-200)] border border-[var(--color-gray-700)] bg-[var(--color-gray-0)]
                  
                  checked:border-[var(--color-azul-500)]
                  checked:bg-[var(--color-azul-500)]

                  relative
                  checked:after:content-['✓']
                  checked:after:absolute
                  checked:after:left-1/2
                  checked:after:top-1/2
                  checked:after:-translate-x-1/2
                  checked:after:-translate-y-1/2
                  checked:after:text-white
                  checked:after:text-[12px]
                  checked:after:font-bold"
                />

                <span className="text-body-sm">
                  {option.label} ({option.count})
                </span>
              </label>
            ))}
          </div>

          {shouldShowButton && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-body-sm text-[var(--color-text-brand-primary)] transition-colors hover:underline"
            >
              {showAll ? 'Mostrar menos' : 'Mostrar más'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
