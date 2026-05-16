'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '../../components/PageHeroSearch';
import Button from '../../components/Button';
import ResearchersList from './components/ResearchersList';
import FilterSection from './components/FilterSection';

import { getResearcherFilters } from '@/services/researchers';
import type { ResearcherFilters } from '@/services/researchers';
import type { ResearcherQueryFilters } from '@/services/researchers';

const BREADCRUMB_ITEMS = [{ label: 'Investigadores' }];

const DEFAULT_FILTERS: ResearcherQueryFilters = {
  baseUnit: [],
};

/** Toggles a value inside a string array (adds it if absent, removes it if present) */
function toggleValue(values: string[] | undefined, value: string): string[] {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

export default function ResearchersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ResearcherQueryFilters>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<ResearcherFilters>({
    baseUnit: [],
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  /**
   * Total researchers matching the current search and filters.
   * Starts as null so nothing is rendered until the first server response
   * arrives, preventing a flash of "0 results" while loading.
   * Updated on every fetch via the onTotalChange callback from ResearchersList.
   */
  const [total, setTotal] = useState<number | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleToggleFilter = useCallback(
    (key: keyof ResearcherQueryFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: toggleValue(prev[key], value),
      }));
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  // Shows the scroll-to-top button once the user scrolls past 400px
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

  const hasActiveFilters =
    Object.values(filters).some((value) => Array.isArray(value) && value.length > 0) ||
    searchQuery.length > 0;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loads the filter sidebar options once when the page mounts
  useEffect(() => {
    getResearcherFilters().then(setFilterOptions);
  }, []);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-neutral-primary)' }}
    >
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Investigadores"
        searchPlaceholder="Buscar por nombre"
        onSearch={handleSearch}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Show/hide filters button — only visible on mobile */}
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

        {/*
          Results counter — mirrors the pattern used in Scientific Productions.
          Only rendered once total is not null (i.e. after the first fetch).
          Automatically updates on every search or filter change because
          ResearchersList calls onTotalChange after each successful request.
        */}
        {total !== null && (
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-neutral-secondary)' }}>
            {total} resultado{total !== 1 ? 's' : ''}
          </p>
        )}

        {/* Main layout: single column on mobile, side-by-side on desktop */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filter sidebar */}
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

          {/* Researcher list with pagination */}
          <div className="flex-1 min-w-0 pb-20">
            {/*
              onTotalChange: callback that ResearchersList calls after each fetch.
              It lifts the total count up to this component so the results
              counter above the sidebar stays in sync with the current query.
            */}
            <ResearchersList searchQuery={searchQuery} filters={filters} onTotalChange={setTotal} />
          </div>
        </div>
      </div>

      {/* Floating scroll-to-top button */}
      {showScrollTopButton && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-brand-primary)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}
    </main>
  );
}
