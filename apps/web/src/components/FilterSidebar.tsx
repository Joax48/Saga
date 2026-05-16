'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

/**
 * Hook that detects if text in a DOM element is truncated.
 * Returns true if the element's scrollWidth > clientWidth.
 */
function useIsTruncated(text: string): [boolean, React.RefObject<HTMLSpanElement>] {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Use ResizeObserver to detect when the element size changes
    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Also check on text change
  useEffect(() => {
    if (!ref.current) return;
    setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
  }, [text]);

  return [isTruncated, ref];
}

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
  /** Enables the drag handle so the user can resize the sidebar. */
  resizable?: boolean;
  /** Initial sidebar width in pixels when resizable. */
  defaultWidthPx?: number;
  /** Minimum sidebar width in pixels when resizable. */
  minWidthPx?: number;
  /** Maximum sidebar width in pixels when resizable. */
  maxWidthPx?: number;
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
      <div className="flex items-center justify-between mb-2 pr-3">
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

function CheckboxOption({
  id,
  label,
  count,
  checked,
  onChange,
  truncate = true,
}: CheckboxOptionProps & { truncate?: boolean }) {
  const [isTruncated, labelRef] = useIsTruncated(label);

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 py-0.5 pr-3 cursor-pointer group"
    >
      <input
        id={id}
        type="checkbox"
        className="checkbox checkbox-xs rounded shrink-0"
        style={{ accentColor: 'var(--color-bg-brand-primary)' }}
        checked={checked}
        onChange={onChange}
      />
      <span
        ref={labelRef}
        className={`flex-1 text-sm font-normal group-hover:underline ${truncate ? 'truncate' : ''}`}
        style={{ color: 'var(--color-gray-600)' }}
        title={isTruncated ? label : undefined}
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* ─── Options popup ──────────────────────────────────────────────────── */

interface OptionsPopupProps {
  title: string;
  options: FacetOption[];
  selectedValues: string[];
  groupKey: string;
  onToggle: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function OptionsPopup({
  title,
  options,
  selectedValues,
  groupKey,
  onToggle,
  onClear,
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
        className="flex flex-col w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-neutral-primary)',
          maxHeight: '80vh',
          width: 'min(96vw, 1180px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-gray-200)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-gray-700)' }}>
            {title}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onClear();
              }}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-text-brand-primary)' }}
            >
              Limpiar
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-danger, #d9534f)' }}
              aria-label="Cerrar"
            >
              Cerrar
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Options grid */}
        <div className="overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-x-8 gap-y-1">
            {options.map((opt) => (
              <CheckboxOption
                key={opt.value}
                id={`popup-filter-${groupKey}-${opt.value}`}
                label={opt.label}
                count={opt.count}
                checked={selectedValues.includes(opt.value)}
                onChange={() => onToggle(opt.value)}
                truncate={false}
              />
            ))}
          </div>
        </div>

        {/* Footer — selected count (left-aligned) */}
        {selectedValues.length > 0 && (
          <div
            className="px-5 py-3 shrink-0 text-xs flex justify-start"
            style={{
              borderTop: '1px solid var(--color-gray-200)',
              color: 'var(--color-text-brand-primary)',
            }}
          >
            <span>
              {selectedValues.length} {title.toLowerCase()} seleccionada
              {selectedValues.length !== 1 ? 's' : ''}
            </span>
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
          onClear={() => {
            // unselect all currently selected values
            selectedValues.forEach((v) => onToggle(v));
          }}
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
  resizable = true,
  defaultWidthPx = 288,
  minWidthPx = 240,
  maxWidthPx = 440,
}: FilterSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidthPx);
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!resizable) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!resizeStartRef.current) return;

      const delta = event.clientX - resizeStartRef.current.startX;
      const nextWidth = clamp(
        resizeStartRef.current.startWidth + delta,
        minWidthPx,
        maxWidthPx,
      );
      setSidebarWidth(nextWidth);
    };

    const handlePointerUp = () => {
      resizeStartRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [maxWidthPx, minWidthPx, resizable]);

  useEffect(() => {
    if (resizable) {
      setSidebarWidth((current) => clamp(current, minWidthPx, maxWidthPx));
    }
  }, [maxWidthPx, minWidthPx, resizable]);

  const sidebarStyle = useMemo<React.CSSProperties>(() => {
    if (!resizable) return {};
    return { width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` };
  }, [resizable, sidebarWidth]);

  return (
    <aside
      className="relative w-full shrink-0 lg:flex-none"
      style={sidebarStyle}
      aria-label="Filtros"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1 pr-3">
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

      {resizable && (
        <button
          type="button"
          aria-label="Redimensionar filtros"
          onPointerDown={(event) => {
            resizeStartRef.current = {
              startX: event.clientX,
              startWidth: sidebarWidth,
            };
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
          }}
          className="absolute top-0 right-0 hidden h-full w-px cursor-col-resize touch-none lg:block"
          style={{
            backgroundColor: 'var(--color-gray-200)',
          }}
        />
      )}
    </aside>
  );
}
