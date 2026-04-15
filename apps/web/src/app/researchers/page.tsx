'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '../../components/PageHeroSearch';
import Button from '../../components/Button';
import ResearchersList from './components/ResearchersList';
import FilterSection from './components/FilterSection';

import type { ResearcherQueryFilters } from '@/services/researchers';

const BREADCRUMB_ITEMS = [{ label: 'Investigadores' }];

const DEFAULT_FILTERS: ResearcherQueryFilters = {
  baseUnit: [],
  ceaCategory: [],
};

function toggleValue(values: string[] | undefined, value: string): string[] {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

export default function ResearchersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ResearcherQueryFilters>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

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

  const hasActiveFilters = Object.values(filters).some(
    (value) => Array.isArray(value) && value.length > 0,
  ) || searchQuery.length > 0;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {/* Mobile filter button */}
        <div className="mb-4 lg:hidden">
          <Button onClick={() => setFiltersVisible(!filtersVisible)} variant="secondary">
            {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <div className="hidden lg:block">
            <FilterSection
              filters={filters}
              onToggleFilter={handleToggleFilter}
              onClearAll={handleClearAll}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Mobile filters */}
          {filtersVisible && (
            <div className="w-full lg:hidden mb-4">
              <FilterSection
                filters={filters}
                onToggleFilter={handleToggleFilter}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 pb-20">
            <ResearchersList searchQuery={searchQuery} filters={filters} />
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
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
