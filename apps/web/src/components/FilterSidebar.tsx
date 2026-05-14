'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 5;
const POPUP_THRESHOLD = 10;

/* ─── Public types ───────────────────────────────────────────────────── */

export interface FacetOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Discriminated union that describes one filter group in the sidebar.
 *
 * `'options'` → a list of checkboxes with expand / popup behaviour
 * `'boolean'` → a single checkbox (e.g. "Acceso abierto")
 */
export type FilterGroupConfig =
  | {
      kind: 'options';
      title: string;
      groupKey: string;
      options: FacetOption[];
      selectedValues: string[];
      onToggle: (value: string) => void;
    }
  | {
      kind: 'boolean';
      title: string;
      id: string;
      label: string;
      count: number;
      checked: boolean;
      onChange: () => void;
    };

export interface FilterSidebarProps {
  /** Ordered list of filter groups to render. */
  groups: FilterGroupConfig[];
  /** When true shows the "Limpiar" button in the header. */
  hasActiveFilters?: boolean;
  /** Called when the user clicks "Limpiar". */
  onClearAll?: () => void;
}

/* ─── Internal sub-components ────────────────────────────────────────── */

interface FilterGroupShellProps {
  title: string;
  children: React.ReactNode;
}

function FilterGroupShell({ title, children }: FilterGroupShellProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold" style={{ color: 'var(--color-gray-700)' }}>
          {title}
        </h3>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? `Ocultar ${title}` : `Mostrar ${title}`}
          className="leading-none"
          style={{
            color: 'var(--color-icon-neutral-secondary)',
            fontSize: 'var(--text-h4)',
          }}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      <div className="border-b border-[var(--color-gray-200)] mb-3" />
      {isOpen ? children : null}
    </section>
  );
}

interface CheckboxOptionProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}

function CheckboxOption({ id, label, count, checked, onChange }: CheckboxOptionProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 py-0.5 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        className="checkbox checkbox-xs rounded shrink-0"
        style={{ accentColor: 'var(--color-bg-brand-primary)' }}
        checked={checked}
        onChange={onChange}
      />
      <span
        className="flex-1 text-sm font-normal group-hover:underline truncate"
        style={{ color: 'var(--color-gray-600)' }}
      >
        {label}
      </span>
      {typeof count === 'number' ? (
        <span
          className="text-sm font-normal shrink-0"
          style={{ color: 'var(--color-gray-600)' }}
        >
          ({count})
        </span>
      ) : null}
    </label>
  );
}

/* ─── Options popup ──────────────────────────────────────────────────── */

interface OptionsPopupProps {
  title: string;
  options: FacetOption[];
  selectedValues: string[];
  groupKey: string;
  onToggle: (value: string) => void;
  onClose: () => void;
}

function OptionsPopup({
  title,
  options,
  selectedValues,
  groupKey,
  onToggle,
  onClose,
}: OptionsPopupProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex flex-col w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-neutral-primary)', maxHeight: '70vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-gray-200)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-gray-700)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-gray-500)' }}
            aria-label="Cerrar"
          >
            Cerrar
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Options grid */}
        <div className="overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-0.5">
            {options.map((opt) => (
              <CheckboxOption
                key={opt.value}
                id={`popup-filter-${groupKey}-${opt.value}`}
                label={opt.label}
                count={opt.count}
                checked={selectedValues.includes(opt.value)}
                onChange={() => onToggle(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Footer — selected count */}
        {selectedValues.length > 0 && (
          <div
            className="px-5 py-3 shrink-0 text-xs"
            style={{
              borderTop: '1px solid var(--color-gray-200)',
              color: 'var(--color-text-brand-primary)',
            }}
          >
            {selectedValues.length} seleccionado{selectedValues.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Expandable options ─────────────────────────────────────────────── */
/*
 * ≤ INITIAL_VISIBLE_COUNT          → all inline, no button
 * > INITIAL_VISIBLE_COUNT and ≤ 10 → inline expand / collapse
 * > 10                             → popup
 */

interface ExpandableOptionsProps {
  title: string;
  options: FacetOption[];
  selectedValues: string[];
  groupKey: string;
  onToggle: (value: string) => void;
}

function ExpandableOptions({
  title,
  options,
  selectedValues,
  groupKey,
  onToggle,
}: ExpandableOptionsProps) {
  const [expanded, setExpanded] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const usePopup = options.length > POPUP_THRESHOLD;
  const needsToggle = options.length > INITIAL_VISIBLE_COUNT;
  const visible =
    needsToggle && !expanded ? options.slice(0, INITIAL_VISIBLE_COUNT) : options;

  return (
    <>
      <div className="flex flex-col gap-0.5">
        {visible.map((opt) => (
          <CheckboxOption
            key={opt.value}
            id={`filter-${groupKey}-${opt.value}`}
            label={opt.label}
            count={opt.count}
            checked={selectedValues.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
          />
        ))}

        {needsToggle &&
          (usePopup ? (
            <button
              onClick={() => setPopupOpen(true)}
              className="mt-1 text-sm font-medium self-start transition-colors hover:underline"
              style={{ color: 'var(--color-text-brand-primary)' }}
            >
              Ver todos ({options.length})
            </button>
          ) : (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 flex items-center gap-0.5 text-sm font-medium self-start transition-colors hover:underline"
              style={{ color: 'var(--color-text-brand-primary)' }}
            >
              {expanded ? (
                <>
                  Mostrar menos <ChevronUp size={14} strokeWidth={2} />
                </>
              ) : (
                <>
                  Mostrar más <ChevronDown size={14} strokeWidth={2} />
                </>
              )}
            </button>
          ))}
      </div>

      {popupOpen && (
        <OptionsPopup
          title={title}
          options={options}
          selectedValues={selectedValues}
          groupKey={groupKey}
          onToggle={onToggle}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */

/**
 * Generic filter sidebar.
 *
 * Receives an ordered array of `FilterGroupConfig` objects and renders each
 * one as a labelled section. All data and callbacks come from the parent —
 * this component has no knowledge of any particular domain model.
 *
 * @example
 * <FilterSidebar
 *   groups={filterGroups}
 *   hasActiveFilters={hasActiveFilters}
 *   onClearAll={handleClearAll}
 * />
 */
export function FilterSidebar({
  groups,
  hasActiveFilters,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-56" aria-label="Filtros">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold" style={{ color: 'var(--color-gray-600)' }}>
          Filtros
        </h2>{' '}
        {hasActiveFilters && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs transition-colors"
            style={{ color: 'var(--color-text-brand-primary)' }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <FilterGroupShell key={group.title} title={group.title}>
          {group.kind === 'options' ? (
            <ExpandableOptions
              title={group.title}
              options={group.options}
              selectedValues={group.selectedValues}
              groupKey={group.groupKey}
              onToggle={group.onToggle}
            />
          ) : (
            <CheckboxOption
              id={group.id}
              label={group.label}
              count={group.count}
              checked={group.checked}
              onChange={group.onChange}
            />
          )}
        </FilterGroupShell>
      ))}
    </aside>
  );
}
