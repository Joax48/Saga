'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import UnitsList from './components/UnitsList';
import { getUnits, getUnitFilters } from '@/services/units';
import type { Unit } from '@/services/units';
import { FilterSidebar, type FilterGroupConfig } from '@/components/FilterSidebar';
import { UnitCardSkeleton } from '@/components/skeletons/CardSkeleton';

const PAGE_SIZE = 9;

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const [researcherOptions, setResearcherOptions] = useState<
    { value: string; label: string; count: number }[]
  >([]);
  const [selectedResearcherIds, setSelectedResearcherIds] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const resultsRef = useRef<HTMLElement | null>(null);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const toTitleCase = (str: string) =>
          str
            .toLowerCase()
            .split(' ')
            .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
            .join(' ');

        const response = await getUnitFilters();
        setResearcherOptions(
          response.researchers.map((option) => ({
            value: option.value,
            label: toTitleCase(option.label),
            count: option.count,
          })),
        );
      } catch (error) {
        console.error('Error cargando filtros de investigadores:', error);
      }
    };
    fetchFilters();
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
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      scrollToResults();
    },
    [scrollToResults],
  );

  const toggleResearcher = useCallback(
    (id: string) => {
      setCurrentPage(1);
      setSelectedResearcherIds((prev) =>
        prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
      );
      scrollToResults();
    },
    [scrollToResults],
  );

  const clearFilters = useCallback(() => {
    setSelectedResearcherIds([]);
    setCurrentPage(1);
    scrollToResults();
  }, [scrollToResults]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      scrollToResults();
    },
    [scrollToResults],
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getUnits(currentPage, PAGE_SIZE, searchQuery, {
          researcherIds: selectedResearcherIds.map(Number),
        });
        setUnits(response.data);
        setTotal(response.total);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
      } catch (error) {
        console.error('Error cargando unidades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage, searchQuery, selectedResearcherIds]);

  const filterGroups: FilterGroupConfig[] = useMemo(
    () => [
      {
        kind: 'options',
        title: 'Investigadores asociados',
        groupKey: 'researchers',
        options: researcherOptions,
        selectedValues: selectedResearcherIds,
        onToggle: toggleResearcher,
      },
    ],
    [researcherOptions, selectedResearcherIds, toggleResearcher],
  );

  const hasActiveFilters = selectedResearcherIds.length > 0;

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <PageHeroSearch
        items={[{ label: 'Unidades' }]}
        title="Unidades"
        searchPlaceholder="Buscar por nombre de la unidad"
        onSearch={handleSearch}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-14 scroll-mt-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {total !== null && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-neutral-secondary)' }}
              >
                {total} resultado{total !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
              <div className="lg:hidden">
                <Button
                  variant="brandOutline"
                  size="sm"
                  onClick={() => setFiltersVisible((prev) => !prev)}
                >
                  {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className={`${filtersVisible ? 'block' : 'hidden'} lg:block`}>
              <FilterSidebar
                groups={filterGroups}
                hasActiveFilters={hasActiveFilters}
                onClearAll={clearFilters}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <UnitCardSkeleton key={i} />
                    ))}
                  </div>
                ) : units.length > 0 ? (
                  <>
                    <UnitsList units={units} />
                    <div className="pt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-base font-medium text-gray-500">
                      No se encontraron unidades asociadas.
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Intenta ajustar los criterios de búsqueda o limpia los filtros.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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
