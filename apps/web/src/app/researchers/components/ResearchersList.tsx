'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '@/components/PageHeroSearch';
import Button from '@/components/Button';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import Pagination from '@/components/Pagination';
import { SortControls } from '@/components/SortControls';
import ExportXlsButton, { type XlsColumn } from '@/components/ExportXlsButton';
import FilterSection from './FilterSection';
import ResearchersCardsGrid from './ResearchersCardsGrid';

import {
  getResearchers,
  getResearcherFilters,
  getResearcherCollaborationFacet,
} from '@/services/researchers';
import type { ResearcherFilters, ResearcherQueryFilters } from '@/services/researchers';
import type { Researcher } from '@/types/researcher-list';

const PAGE_SIZE = 18;
const BREADCRUMB_ITEMS = [{ label: 'Perfiles' }];
const SCROLL_KEY = 'researchers-scroll-y';

const DEFAULT_FILTERS: ResearcherQueryFilters = {
  baseUnit: [],
  collaborationCountry: [],
  sortOrder: 'asc',
};

// Columns exported to the Excel file from the currently loaded page of results.
const RESEARCHER_COLUMNS: XlsColumn<Researcher>[] = [
  {
    header: 'Nombre',
    getValue: (r) => [r.name, r.firstSurname, r.secondSurname].filter(Boolean).join(' '),
  },
  {
    header: 'Nombres alternativos',
    getValue: (r) => (r.altNames ?? []).join('; '),
  },
  {
    header: 'Unidades de trabajo',
    getValue: (r) => r.workUnits.map((u) => u.name).join('; '),
  },
  {
    header: 'Unidades de colaboración',
    getValue: (r) => r.linkedUnits.map((u) => u.name).join('; '),
  },
  { header: 'Id del perfil', getValue: (r) => r.id },
];

function toggleValue(values: string[] | undefined, value: string): string[] {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

interface ResearchersListProps {
  initialTotal: number;
  initialFilterOptions: ResearcherFilters | null;
  initialSearchQuery: string;
  initialPage: number;
  initialFilters: ResearcherQueryFilters;
}

export default function ResearchersList({
  initialTotal,
  initialFilterOptions,
  initialSearchQuery,
  initialPage,
  initialFilters,
}: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [filterOptions, setFilterOptions] = useState<ResearcherFilters>(
    initialFilterOptions ?? { baseUnit: [], collaborationCountry: [] },
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filters, setFilters] = useState<ResearcherQueryFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(initialTotal / PAGE_SIZE)),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollToListRef = useRef(false);
  const isFirstPageRender = useRef(true);

  // Restore scroll position when returning from a detail page
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      sessionStorage.removeItem(SCROLL_KEY);
      requestAnimationFrame(() => window.scrollTo({ top: parseInt(saved, 10) }));
    }
  }, []);

  // Scroll to the list only after an explicit user action (page, search, filter).
  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    if (!shouldScrollToListRef.current) return;
    shouldScrollToListRef.current = false;
    if (listContainerRef.current) {
      const navbar = document.querySelector('header') ?? document.querySelector('nav');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      const top =
        listContainerRef.current.getBoundingClientRect().top +
        window.scrollY -
        navbarHeight -
        16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [currentPage, searchQuery, filters]);

  // Fetches researchers whenever the page, search query, or filters change.
  // The cleanup sets `cancelled = true` so a stale response from a superseded
  // request never overwrites the state with outdated researcher cards.
  useEffect(() => {
    let cancelled = false;

    const fetchResearchers = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await getResearchers({
          page: currentPage,
          limit: PAGE_SIZE,
          q: searchQuery,
          filters: {
            baseUnit: filters.baseUnit,
            collaborationCountry: filters.collaborationCountry,
            profileType: 'UCR',
          },
          sort: { order: filters.sortOrder },
        });
        if (cancelled) return;
        setResearchers(response.data);
        setTotalResults(response.total);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching researchers:', error);
          setResearchers([]);
          setTotalResults(0);
          setTotalPages(1);
          setLoadError(
            'No se pudieron cargar los perfiles. Intenta nuevamente más tarde.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchResearchers();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, filters]);

  // Refetch the filter facets whenever the search term or any selected filter
  // changes so the sidebar counts stay in sync with the visible list.
  useEffect(() => {
    let cancelled = false;
    getResearcherFilters({
      q: searchQuery,
      baseUnit: filters.baseUnit,
      collaborationCountry: filters.collaborationCountry,
    })
      .then((options) => {
        if (!cancelled)
          setFilterOptions((prev) => ({ ...prev, baseUnit: options.baseUnit }));
      })
      .catch(() => {});
    getResearcherCollaborationFacet({
      q: searchQuery,
      baseUnit: filters.baseUnit,
      collaborationCountry: filters.collaborationCountry,
    })
      .then((collaborationCountry) => {
        if (!cancelled) setFilterOptions((prev) => ({ ...prev, collaborationCountry }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [searchQuery, filters]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopButton(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = useCallback((query: string) => {
    shouldScrollToListRef.current = true;
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleToggleFilter = useCallback(
    (key: keyof ResearcherQueryFilters, value: string) => {
      shouldScrollToListRef.current = true;
      // Only array-valued filters (baseUnit, collaborationCountry) are toggled
      // through this handler, so the value is always a string[].
      setFilters((prev) => ({
        ...prev,
        [key]: toggleValue(prev[key] as string[] | undefined, value),
      }));
      setCurrentPage(1);
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    shouldScrollToListRef.current = true;
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    shouldScrollToListRef.current = true;
    setCurrentPage(page);
  }, []);

  const hasActiveFilters =
    Object.values(filters).some((value) => Array.isArray(value) && value.length > 0) ||
    searchQuery.length > 0;

  const activeBaseUnits = (filters.baseUnit ?? []).map((unit) => unit.toLowerCase());

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}
    >
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Perfiles"
        searchPlaceholder="Buscar perfil por nombre, apellido o nombre completo"
        onSearch={handleSearch}
        initialSearchValue={initialSearchQuery}
      />

      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-8 scroll-mt-10">
        <div className="max-w-6xl mx-auto">
        {!loadError && (
          <div className="mb-4 lg:hidden">
            <Button
              variant="brandOutline"
              size="sm"
              onClick={() => setFiltersVisible((prev) => !prev)}
              aria-expanded={filtersVisible}
              aria-controls="researchers-filter-sidebar"
            >
              {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </div>
        )}

        {totalResults !== null && !loadError && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-body-md"
              style={{ color: 'var(--color-text-neutral-secondary)' }}
            >
              {totalResults} resultado{totalResults !== 1 ? 's' : ''}
            </p>
            <ExportXlsButton
              data={researchers}
              columns={RESEARCHER_COLUMNS}
              filename="perfiles"
            />
          </div>
        )}

        {loadError && <ApiErrorMessage className="mb-6" message={loadError} />}

        {!loadError && (
          <SortControls
            className="mb-4"
            label="Ordenamiento alfabético"
            sortBy="name"
            sortOrder={filters.sortOrder ?? 'asc'}
            onSortByChange={() => {}}
            onSortOrderChange={(value) => {
              shouldScrollToListRef.current = true;
              setFilters((prev) => ({ ...prev, sortOrder: value as 'asc' | 'desc' }));
              setCurrentPage(1);
            }}
            sortByOptions={[{ value: 'name', label: 'Nombre del perfil' }]}
            sortOrderOptions={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' },
            ]}
          />
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {!loadError && (
            <div
              id="researchers-filter-sidebar"
              className={`${filtersVisible ? 'block' : 'hidden'} lg:block`}
            >
              <FilterSection
                filters={filters}
                filterOptions={filterOptions}
                onToggleFilter={handleToggleFilter}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          )}

          <div ref={listContainerRef} className="flex-1 min-w-0 pb-20">
            {!loadError && (
              <ResearchersCardsGrid
                researchers={researchers}
                isLoading={isLoading}
                pageSize={PAGE_SIZE}
                activeBaseUnits={activeBaseUnits}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onCardClick={() =>
                  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
                }
                showPagination={false}
              />
            )}

            {!loadError &&
              !isLoading &&
              researchers.length === 0 &&
              totalResults !== null && (
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

        {!isLoading &&
          !loadError &&
          totalResults !== null &&
          totalResults > 0 &&
          totalPages > 1 && (
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
