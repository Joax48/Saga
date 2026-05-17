'use client';

import { useMemo, useCallback, useTransition, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import { FilterSidebar } from '../../../components/FilterSidebar';
import { ProductionCard } from './ProductionCard';
import type { FilterGroupConfig } from '../../../components/FilterSidebar';
import type { SummaryScientificProduction } from '@/types';
import type { FiltersApiResponse } from '@/services/scientific-productions';

/* ─── Constants ──────────────────────────────────────────────────────── */

const BREADCRUMB_ITEMS = [{ label: 'Producción científica' }];

interface ActiveFilters {
  q?: string;
  type?: string[];
  openAccess?: boolean;
  year?: string[];
  keywords?: string[];
}

interface ScientificProductionsViewProps {
  productions: SummaryScientificProduction[];
  total: number;
  currentPage: number;
  limit: number;
  activeFilters: ActiveFilters;
  filterOptions: FiltersApiResponse;
}

export function ScientificProductionsView({
  productions,
  total,
  currentPage,
  limit,
  activeFilters,
  filterOptions,
}: ScientificProductionsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (
      updates: Record<string, string | null>,
      resetPage = true,
      mode: 'push' | 'replace' = 'push',
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (resetPage) {
        params.set('page', '1');
      }

      startTransition(() => {
        const url = `${pathname}?${params.toString()}`;
        mode === 'replace'
          ? router.replace(url, { scroll: false })
          : router.push(url, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    if (!searchParams.get('page')) {
      updateParams({ page: '1' }, false, 'replace');
    }
    // Se desactiva para que solo se realice una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      updateParams({ q: q || null });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: String(page) }, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateParams],
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    return [
      {
        kind: 'options',
        title: 'Tipo',
        groupKey: 'type',
        options: filterOptions.types ?? [],
        selectedValues: activeFilters.type ?? [],
        onToggle: (v) => {
          const current = activeFilters.type ?? [];
          const updated = current.includes(v)
            ? current.filter((t) => t !== v)
            : [...current, v];
          updateParams({ type: updated.length > 0 ? updated.join(',') : null });
          scrollToResults();
        },
      },
      {
        kind: 'boolean',
        title: 'Acceso abierto',
        id: 'filter-open-access',
        label: 'Contenido abierto',
        count: filterOptions.openAccessCount ?? 0,
        checked: activeFilters.openAccess ?? false,
        onChange: () => {
          updateParams({ openAccess: activeFilters.openAccess ? null : 'true' });
          scrollToResults();
        },
      },
      {
        kind: 'options',
        title: 'Año de publicación',
        groupKey: 'year',
        options: filterOptions.years ?? [],
        selectedValues: activeFilters.year ?? [],
        onToggle: (v) => {
          const current = activeFilters.year ?? [];
          const updated = current.includes(v)
            ? current.filter((y) => y !== v)
            : [...current, v];
          updateParams({ year: updated.length > 0 ? updated.join(',') : null });
          scrollToResults();
        },
      },
      {
        kind: 'options',
        title: 'Palabras clave',
        groupKey: 'keyword',
        options: filterOptions.keywords ?? [],
        selectedValues: activeFilters.keywords ?? [],
        onToggle: (v) => {
          const current = activeFilters.keywords ?? [];
          const updated = current.includes(v)
            ? current.filter((kw) => kw !== v)
            : [...current, v];
          updateParams({ keywords: updated.length > 0 ? updated.join(',') : null });
          scrollToResults();
        },
      },
    ];
  }, [filterOptions, activeFilters, updateParams]);

  const resultsRef = useRef<HTMLElement>(null);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const hasActiveFilters =
    !!activeFilters.q ||
    !!activeFilters.type?.length ||
    !!activeFilters.openAccess ||
    !!activeFilters.year?.length ||
    (activeFilters.keywords?.length ?? 0) > 0;

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  return (
    <main className="bg-(--color-bg-neutral-secondary) min-h-screen">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Producción científica"
        searchPlaceholder="Buscar por título"
        onSearch={handleSearch}
      />

      <section
        ref={resultsRef}
        className="bg-(--color-bg-neutral-primary) px-6 lg:px-10 py-14 scroll-mt-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 lg:hidden">
            <Button
              variant="brandOutline"
              size="sm"
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="scientific-productions-filter-sidebar"
            >
              {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </div>

          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            {total} resultado{total !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div
              id="scientific-productions-filter-sidebar"
              className={`${filtersVisible ? 'block' : 'hidden'} lg:block`}
            >
              <FilterSidebar
                groups={filterGroups}
                hasActiveFilters={hasActiveFilters}
                onClearAll={handleClearAll}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                {productions.length > 0 ? (
                  productions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-base font-medium text-gray-500">
                      No se encontraron resultados.
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Intenta ajustar los filtros o el término de búsqueda.
                    </p>
                  </div>
                )}

                {productions.length > 0 && totalPages > 1 && (
                  <div className="pt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
