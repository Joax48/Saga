'use client';

import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ResearcherCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '../../components/PageHeroSearch';
import Button from '../../components/Button';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import Pagination from '@/components/Pagination';
import ResearchersList from './components/ResearchersList';
import FilterSection from './components/FilterSection';

import {
  getResearcherFilters,
  getResearcherCollaborationFacet,
} from '@/services/researchers';
import type { ResearcherFilters } from '@/services/researchers';
import type { ResearcherQueryFilters } from '@/services/researchers';

const BREADCRUMB_ITEMS = [{ label: 'Perfiles' }];

const DEFAULT_FILTERS: ResearcherQueryFilters = {
  baseUnit: [],
  collaborationCountry: [],
  sortOrder: 'asc',
};

function toggleValue(values: string[] | undefined, value: string): string[] {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

function ResearchersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<ResearcherQueryFilters>(() => ({
    baseUnit: searchParams.getAll('unit'),
    collaborationCountry: searchParams.getAll('collaborationCountry'),
    sortOrder: (searchParams.get('sort') as 'asc' | 'desc') ?? 'asc',
  }));
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isFirstPageRender = useRef(true);
  const [filterOptions, setFilterOptions] = useState<ResearcherFilters>({
    baseUnit: [],
    collaborationCountry: [],
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [listLoadError, setListLoadError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  // External profiles temporarily disabled — only UCR profiles are listed.
  // const [profileType, setProfileType] = useState<'UCR' | 'EXTERNAL' | undefined>(undefined);
  const shouldScrollToListRef = useRef(false);
  const SCROLL_KEY = 'researchers-scroll-y';

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

    if (!shouldScrollToListRef.current) {
      return;
    }

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

  // Sync state to URL — skip first render and wrap in startTransition to avoid
  // triggering the Suspense fallback during URL updates.
  const isFirstSyncRender = useRef(true);
  useEffect(() => {
    if (isFirstSyncRender.current) {
      isFirstSyncRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    for (const unit of filters.baseUnit ?? []) params.append('unit', unit);
    for (const country of filters.collaborationCountry ?? [])
      params.append('collaborationCountry', country);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (filters.sortOrder && filters.sortOrder !== 'asc')
      params.set('sort', filters.sortOrder);
    const qs = params.toString();
    startTransition(() => {
      router.replace(`/researchers${qs ? `?${qs}` : ''}`, { scroll: false });
    });
  }, [searchQuery, filters, currentPage, router]);

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTopButton(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasActiveFilters =
    Object.values(filters).some((value) => Array.isArray(value) && value.length > 0) ||
    searchQuery.length > 0;

  // Refetch the filter facets whenever the search term or any selected filter
  // changes so the sidebar counts stay in sync with the visible list.
  useEffect(() => {
    let cancelled = false;
    getResearcherFilters(searchQuery, filters.baseUnit, filters.collaborationCountry)
      .then((options) => {
        if (!cancelled) {
          setFilterOptions((prev) => ({ ...prev, baseUnit: options.baseUnit }));
        }
      })
      .catch(() => {});
    getResearcherCollaborationFacet(
      searchQuery,
      filters.baseUnit,
      filters.collaborationCountry,
    )
      .then((collaborationCountry) => {
        if (!cancelled) {
          setFilterOptions((prev) => ({ ...prev, collaborationCountry }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [searchQuery, filters]);

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
        initialSearchValue={searchQuery}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!listLoadError && (
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

        {total !== null && (
          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            {total} resultado{total !== 1 ? 's' : ''}
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            Ordenar por
          </span>
          <select
            value={filters.sortOrder ?? 'asc'}
            onChange={(e) => {
              shouldScrollToListRef.current = true;
              setFilters((prev) => ({
                ...prev,
                sortOrder: e.target.value as 'asc' | 'desc',
              }));
              setCurrentPage(1);
            }}
            className="text-sm border rounded px-2 py-1"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {!listLoadError && (
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
            <ResearchersList
              searchQuery={searchQuery}
              filters={filters}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onTotalChange={setTotal}
              onLoadErrorChange={setListLoadError}
              onTotalPagesChange={setTotalPages}
              profileType="UCR"
            />
          </div>
        </div>

        {!listLoadError && total !== null && total > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {showScrollTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-brand-primary)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}
    </main>
  );
}

function ResearchersPageFallback() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}
    >
      <section className="px-6 lg:px-10 pt-4 pb-20 bg-[url('/ucr_hero_image.png')] bg-cover bg-center">
        <div className="flex justify-start h-14" />
        <div className="max-w-6xl mx-auto">
          <div className="pt-2 pb-4">
            <div className="skeleton h-4 w-20 rounded opacity-40" />
          </div>
          <div className="flex justify-start h-10" />
          <div className="skeleton h-10 w-32 rounded mx-auto opacity-40" />
          <div className="mt-6 skeleton h-12 w-full max-w-xl mx-auto rounded opacity-40" />
        </div>
        <div className="flex justify-start h-30" />
      </section>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            Ordenar por
          </span>
          <select
            defaultValue="asc"
            disabled
            className="text-sm border rounded px-2 py-1"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <ResearcherCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ResearchersPage() {
  return (
    <Suspense fallback={<ResearchersPageFallback />}>
      <ResearchersPageContent />
    </Suspense>
  );
}
