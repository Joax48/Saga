'use client';

import { useMemo, useCallback, useTransition, useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { FilterSidebar } from '../../../components/FilterSidebar';
import { SortControls } from '@/components/SortControls';
import { ProductionCard } from './ProductionCard';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';
import type { FilterGroupConfig } from '../../../components/FilterSidebar';
import type { SummaryScientificProduction } from '@/types';
import type { FiltersApiResponse } from '@/services/scientific-productions';

/* ─── Constants ──────────────────────────────────────────────────────── */

const BREADCRUMB_ITEMS = [{ label: 'Producción científica' }];

/* ─── Interfaces ──────────────────────────────────────────────────────── */

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
  sortBy: 'title' | 'publication_year';
  sortOrder: 'asc' | 'desc';
  hasApiError?: boolean;
}

export function ScientificProductionsView({
  productions,
  total,
  currentPage,
  limit,
  activeFilters,
  filterOptions,
  sortBy,
  sortOrder,
  hasApiError = false,
}: ScientificProductionsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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

        router.refresh();
      });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [updateParams],
  );

  const handleSortByChange = useCallback(
    (value: string) => {
      updateParams({ sortBy: value });
    },
    [updateParams],
  );

  const handleSortOrderChange = useCallback(
    (value: string) => {
      updateParams({ sortOrder: value });
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
  }, [filterOptions, activeFilters, updateParams, scrollToResults]);

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
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Producción científica"
        searchPlaceholder="Buscar por título"
        onSearch={handleSearch}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-8 scroll-mt-10"
      >
        <div className="max-w-6xl mx-auto">
          {!hasApiError && (
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
          )}

          {!hasApiError && (
            <p
              className="mb-4 text-body-md"
              style={{ color: 'var(--color-text-neutral-secondary)' }}
            >
              {total} resultado{total !== 1 ? 's' : ''}
            </p>
          )}

          {hasApiError && (
            <ApiErrorMessage
              className="mb-6"
              message="No se pudo cargar la producción científica. Intenta nuevamente más tarde."
            />
          )}

          {!hasApiError && (
            <SortControls
              className="mb-4"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
              sortByOptions={[
                { value: 'publication_year', label: 'Año de publicación' },
                { value: 'title', label: 'Título' },
              ]}
              sortOrderOptions={[
                { value: 'desc', label: 'Descendente' },
                { value: 'asc', label: 'Ascendente' },
              ]}
            />
          )}

          <div className="flex flex-col gap-8 lg:flex-row">
            {!hasApiError && (
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
            )}

            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                ) : hasApiError ? null : productions.length > 0 ? (
                  productions.map((production) => (
                    <ProductionCard key={production.id} production={production} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-body-lg font-bold text-[var(--color-text-neutral-secondary)]">
                      No se encontraron resultados.
                    </p>
                    <p className="mt-1 text-body-md text-[var(--color-text-neutral-tertiary)]">
                      Intenta ajustar los filtros o el término de búsqueda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isPending && !hasApiError && productions.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </section>

      {showScrollTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-info-subtle)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}
    </main>
  );
}
