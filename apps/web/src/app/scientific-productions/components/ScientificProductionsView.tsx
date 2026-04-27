'use client';

import { useMemo, useCallback, useTransition, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import { FilterSidebar } from '../../../components/FilterSidebar';
import { ProductionCard } from './ProductionCard';
import type { FilterGroupConfig } from '../../../components/FilterSidebar';
import type { SummaryScientificProduction } from '@/types';

/* ─── Constants ──────────────────────────────────────────────────────── */

const BREADCRUMB_ITEMS = [{ label: 'Producción científica' }];

interface ActiveFilters {
  q?: string;
  type?: string;
  openAccess?: boolean;
  year?: number;
  keywords?: string[];
}

interface ScientificProductionsViewProps {
  productions: SummaryScientificProduction[];
  total: number;
  currentPage: number;
  limit: number;
  activeFilters: ActiveFilters;
}

export function ScientificProductionsView({
  productions,
  total,
  currentPage,
  limit,
  activeFilters,
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
        mode === 'replace' ? router.replace(url) : router.push(url);
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

  // los filterGroups ahora leen activeFilters en lugar del estado local
  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    // los conteos vienen de los items de la página actual
    // cuando tengas el endpoint de facets del servidor los reemplazás
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

    const typeCounts = productions.reduce<Record<string, number>>((acc, p) => {
      acc[p.type.subcategory] = (acc[p.type.subcategory] ?? 0) + 1;
      return acc;
    }, {});

    return [
      {
        kind: 'options',
        title: 'Tipo',
        groupKey: 'type',
        options: Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: activeFilters.type ? [activeFilters.type] : [],
        onToggle: (v) =>
          updateParams({
            type: activeFilters.type === v ? null : v,
          }),
      },
      {
        kind: 'boolean',
        title: 'Acceso abierto',
        id: 'filter-open-access',
        label: 'Contenido abierto',
        count: productions.filter((p) => p.open_access).length,
        checked: activeFilters.openAccess ?? false,
        onChange: () =>
          updateParams({
            openAccess: activeFilters.openAccess ? null : 'true',
          }),
      },
      {
        kind: 'options',
        title: 'Año de publicación',
        groupKey: 'year',
        options: Object.entries(yearCounts)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: activeFilters.year ? [String(activeFilters.year)] : [],
        onToggle: (v) =>
          updateParams({
            year: activeFilters.year === Number(v) ? null : v,
          }),
      },
      {
        kind: 'options',
        title: 'Palabras clave',
        groupKey: 'keyword',
        options: Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count })),
        selectedValues: activeFilters.keywords ?? [],
        onToggle: (v) => {
          const current = activeFilters.keywords ?? [];
          const updated = current.includes(v)
            ? current.filter((kw) => kw !== v)
            : [...current, v];
          updateParams({
            keywords: updated.length > 0 ? updated.join(',') : null,
          });
        },
      },
    ];
  }, [
    productions,
    activeFilters.type,
    activeFilters.openAccess,
    activeFilters.year,
    activeFilters.keywords,
    updateParams,
  ]);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const hasActiveFilters =
    !!activeFilters.q ||
    !!activeFilters.type ||
    !!activeFilters.openAccess ||
    !!activeFilters.year ||
    (activeFilters.keywords?.length ?? 0) > 0;

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname); // URL sin params = sin filtros
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

      <section className="bg-(--color-bg-neutral-primary) px-6 lg:px-10 py-14">
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
