'use client';

import { useState, useMemo, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import Breadcrumb from '@/components/Breadcrumb';
import { FilterSidebar } from '../../../components/FilterSidebar';
import type { FilterGroupConfig } from '../../../components/FilterSidebar';
import { ProductionCard } from './ProductionCard';
import type { ScientificProduction, ProductionFilters } from '@/types';

/* ─── Constants ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

const BREADCRUMB_ITEMS = [{ label: 'Producción científica' }];

const DEFAULT_FILTERS: ProductionFilters = {
  searchQuery: '',
  selectedTypes: [],
  openAccessOnly: false,
  selectedYears: [],
  selectedKeywords: [],
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function applyFilters(
  productions: ScientificProduction[],
  filters: ProductionFilters,
): ScientificProduction[] {
  const { searchQuery, selectedTypes, openAccessOnly, selectedYears, selectedKeywords } =
    filters;
  const query = searchQuery.toLowerCase().trim();

  return productions.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(p.type.subcategory))
      return false;
    if (openAccessOnly && !p.open_access) return false;
    if (selectedYears.length > 0 && !selectedYears.includes(p.publication_year))
      return false;
    if (
      selectedKeywords.length > 0 &&
      !selectedKeywords.some((kw) => p.keywords.includes(kw))
    )
      return false;
    return true;
  });
}

/* ─── Component ──────────────────────────────────────────────────────── */

interface ScientificProductionsViewProps {
  productions: ScientificProduction[];
}

/**
 * Main client-side view for the scientific productions list page.
 *
 * Owns all filter, search, and pagination state. Computes facet counts and
 * builds the `FilterGroupConfig[]` array that drives the generic sidebar.
 */
export function ScientificProductionsView({
  productions,
}: ScientificProductionsViewProps) {
  const [filters, setFilters] = useState<ProductionFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Handlers ── */

  const handleFiltersChange = useCallback((updated: Partial<ProductionFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      handleFiltersChange({ searchQuery: query });
    },
    [handleFiltersChange],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ── Derived data ── */

  const filtered = useMemo(
    () => applyFilters(productions, filters),
    [productions, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  /* ── Filter groups (facet computation + handlers bundled for the sidebar) ── */

  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    const typeCounts = productions.reduce<Record<string, number>>((acc, p) => {
      acc[p.type.subcategory] = (acc[p.type.subcategory] ?? 0) + 1;
      return acc;
    }, {});

    const yearCounts = productions.reduce<Record<number, number>>((acc, p) => {
      acc[p.publication_year] = (acc[p.publication_year] ?? 0) + 1;
      return acc;
    }, {});

    const keywordCounts = productions.reduce<Record<string, number>>((acc, p) => {
      p.keywords.forEach((kw) => {
        acc[kw] = (acc[kw] ?? 0) + 1;
      });
      return acc;
    }, {});

    const openAccessCount = productions.filter((p) => p.open_access).length;

    return [
      {
        kind: 'options',
        title: 'Tipo',
        groupKey: 'type',
        options: Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: filters.selectedTypes,
        onToggle: (v) =>
          handleFiltersChange({ selectedTypes: toggleValue(filters.selectedTypes, v) }),
      },
      {
        kind: 'boolean',
        title: 'Acceso abierto',
        id: 'filter-open-access',
        label: 'Contenido abierto',
        count: openAccessCount,
        checked: filters.openAccessOnly,
        onChange: () => handleFiltersChange({ openAccessOnly: !filters.openAccessOnly }),
      },
      {
        kind: 'options',
        title: 'Año de publicación',
        groupKey: 'year',
        options: Object.entries(yearCounts)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: filters.selectedYears.map(String),
        onToggle: (v) =>
          handleFiltersChange({
            selectedYears: toggleValue(filters.selectedYears, Number(v)),
          }),
      },
      {
        kind: 'options',
        title: 'Palabras clave',
        groupKey: 'keyword',
        options: Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: filters.selectedKeywords,
        onToggle: (v) =>
          handleFiltersChange({
            selectedKeywords: toggleValue(filters.selectedKeywords, v),
          }),
      },
    ];
  }, [productions, filters, handleFiltersChange]);

  const hasActiveFilters =
    filters.selectedTypes.length > 0 ||
    filters.openAccessOnly ||
    filters.selectedYears.length > 0 ||
    filters.selectedKeywords.length > 0;

  const handleClearAll = useCallback(
    () =>
      handleFiltersChange({
        selectedTypes: [],
        openAccessOnly: false,
        selectedYears: [],
        selectedKeywords: [],
      }),
    [handleFiltersChange],
  );

  /* ── Render ── */

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}
    >
      {/* ── Page header ── */}
      <div
        className="px-6 pb-24"
        style={{ backgroundColor: 'var(--color-bg-neutral-secondary)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="pt-14 pb-4">
            <Breadcrumb items={BREADCRUMB_ITEMS} />
          </div>

          <h1
            className="mb-6 text-center font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--text-h2--line-height)',
              color: 'var(--color-text-neutral-primary)',
            }}
          >
            Producción científica
          </h1>

          <SearchBar placeholder="Buscar por título" onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6">
        {/* Result count (not used for now, but could be re-enabled if desired) 
        <p
          className="mb-4 text-sm"
          style={{ color: 'var(--color-text-neutral-secondary)' }}
        >
          {filtered.length === productions.length
            ? `${productions.length} resultado${productions.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${productions.length} resultado${productions.length !== 1 ? 's' : ''}`}
        </p> */}

        {/* Content grid */}
        <div className="flex gap-8 pb-12">
          {/*(not used for now, but could be re-enabled if desired) 
          <FilterSidebar
            groups={filterGroups}
            hasActiveFilters={hasActiveFilters}
            onClearAll={handleClearAll}
          />*/}

          {/* Results */}
          <section className="flex-1 min-w-0">
            {paginated.length > 0 ? (
              <>
                <div>
                  {paginated.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                role="status"
                aria-live="polite"
              >
                <p
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-neutral-secondary)' }}
                >
                  No se encontraron resultados.
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--color-text-neutral-tertiary)' }}
                >
                  Intenta ajustar los filtros o el término de búsqueda.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
