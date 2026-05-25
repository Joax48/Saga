'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ResearcherCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '../../components/PageHeroSearch';
import Button from '../../components/Button';
import ResearchersList from './components/ResearchersList';
import FilterSection from './components/FilterSection';

import { getResearcherFilters } from '@/services/researchers';
import type { ResearcherFilters } from '@/services/researchers';
import type { ResearcherQueryFilters } from '@/services/researchers';

const BREADCRUMB_ITEMS = [{ label: 'Perfiles' }];

const DEFAULT_FILTERS: ResearcherQueryFilters = {
  baseUnit: [],
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
  }));
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get('page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isFirstPageRender = useRef(true);
  const [filterOptions, setFilterOptions] = useState<ResearcherFilters>({ baseUnit: [] });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  // Scroll to the top of the list container whenever the page changes,
  // skipping the initial render so the page doesn't jump on first load.
  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    if (listContainerRef.current) {
      const navbar = document.querySelector('header') ?? document.querySelector('nav');
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      const top =
        listContainerRef.current.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Sync state to URL so the back button restores page + filters + search
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    for (const unit of filters.baseUnit ?? []) params.append('unit', unit);
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    router.replace(`/researchers${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [searchQuery, filters, currentPage, router]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleToggleFilter = useCallback(
    (key: keyof ResearcherQueryFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: toggleValue(prev[key], value) }));
      setCurrentPage(1);
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
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
  // The `cancelled` flag discards stale responses if the user types quickly.
  useEffect(() => {
    let cancelled = false;
    getResearcherFilters(searchQuery, filters.baseUnit).then((options) => {
      if (!cancelled) setFilterOptions(options);
    });
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

        {total !== null && (
          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            {total} resultado{total !== 1 ? 's' : ''}
          </p>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
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

          <div ref={listContainerRef} className="flex-1 min-w-0 pb-20">
            <ResearchersList
              searchQuery={searchQuery}
              filters={filters}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onTotalChange={setTotal}
            />
          </div>
        </div>
      </div>

      {showScrollTopButton && (
        <Button
          variant="primary"
          size="md"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          iconLeft={<ChevronUp size={32} strokeWidth={3.2} />}
          aria-label="Volver arriba"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full px-0 shadow-lg"
        />
      )}
    </main>
  );
}

function ResearchersPageFallback() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}>
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
