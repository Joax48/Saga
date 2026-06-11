'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import UnitsList from './components/UnitsList';
import { getUnits, getUnitFilters } from '@/services/units';
import type { Unit, UnitSortOrder } from '@/services/units';
import { FilterSidebar, type FilterGroupConfig } from '@/components/FilterSidebar';
import { UnitCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { SortControls } from '@/components/SortControls';

const PAGE_SIZE = 9;

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const [researcherOptions, setResearcherOptions] = useState<
    { value: string; label: string; count: number }[]
  >([]);
  const [selectedResearcherIds, setSelectedResearcherIds] = useState<string[]>([]);
  const [researcherBaseUnitOptions, setResearcherBaseUnitOptions] = useState<
    { value: string; label: string; count: number }[]
  >([]);
  const [selectedResearcherBaseUnitIds, setSelectedResearcherBaseUnitIds] = useState<
    string[]
  >([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<UnitSortOrder>('asc');

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        setResearcherBaseUnitOptions(
          response.researchersByBaseUnit.map((option) => ({
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
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchQuery(query);
        setCurrentPage(1);
        scrollToResults();
      }, 400);
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

  const toggleResearcherBaseUnit = useCallback(
    (id: string) => {
      setCurrentPage(1);
      setSelectedResearcherBaseUnitIds((prev) =>
        prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
      );
      scrollToResults();
    },
    [scrollToResults],
  );

  const clearFilters = useCallback(() => {
    setSelectedResearcherIds([]);
    setSelectedResearcherBaseUnitIds([]);
    setSortOrder('asc');
    setCurrentPage(1);
    scrollToResults();
  }, [scrollToResults]);

  const handleSortOrderChange = useCallback(
    (value: UnitSortOrder) => {
      setSortOrder(value);
      setCurrentPage(1);
      scrollToResults();
    },
    [scrollToResults],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      scrollToResults();
    },
    [scrollToResults],
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await getUnits(currentPage, PAGE_SIZE, searchQuery, {
          researcherIds: selectedResearcherIds.map(Number),
          researcherBaseUnitIds: selectedResearcherBaseUnitIds.map(Number),
          sortBy: 'name',
          sortOrder,
        });

        if (!controller.signal.aborted) {
          setUnits(response.data);
          setTotal(response.total);
          setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
        }
      } catch (error) {
        console.error('Error cargando unidades:', error);
        setUnits([]);
        setTotal(0);
        setTotalPages(1);
        setLoadError('No se pudieron cargar las unidades. Intenta nuevamente más tarde.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [
    currentPage,
    searchQuery,
    selectedResearcherIds,
    selectedResearcherBaseUnitIds,
    sortOrder,
  ]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filterGroups: FilterGroupConfig[] = useMemo(
    () => [
      {
        kind: 'options',
        title: 'Personas investigadoras por unidad de pago',
        groupKey: 'researchersByBaseUnit',
        options: researcherBaseUnitOptions,
        selectedValues: selectedResearcherBaseUnitIds,
        onToggle: toggleResearcherBaseUnit,
      },
      {
        kind: 'options',
        title: 'Personas investigadoras asociadas',
        groupKey: 'researchers',
        options: researcherOptions,
        selectedValues: selectedResearcherIds,
        onToggle: toggleResearcher,
      },
    ],
    [
      researcherBaseUnitOptions,
      selectedResearcherBaseUnitIds,
      toggleResearcherBaseUnit,
      researcherOptions,
      selectedResearcherIds,
      toggleResearcher,
    ],
  );

  const hasActiveFilters =
    selectedResearcherIds.length > 0 || selectedResearcherBaseUnitIds.length > 0;

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen flex flex-col">
      <PageHeroSearch
        items={[{ label: 'Unidades' }]}
        title="Unidades"
        searchPlaceholder="Buscar por nombre de la unidad"
        onSearch={handleSearch}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-8 scroll-mt-10 flex-1"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {total !== null && !loadError && (
              <p
                className="text-body-md"
                style={{ color: 'var(--color-text-neutral-secondary)' }}
              >
                {total} resultado{total !== 1 ? 's' : ''}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
              {!loadError && (
                <div className="lg:hidden">
                  <Button
                    variant="brandOutline"
                    size="sm"
                    onClick={() => setFiltersVisible((prev) => !prev)}
                  >
                    {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loadError && <ApiErrorMessage className="mb-6" message={loadError} />}

          {!loadError && (
            <SortControls
              className="mb-4"
              sortBy="name"
              sortOrder={sortOrder}
              onSortByChange={() => {}}
              onSortOrderChange={handleSortOrderChange}
              sortByOptions={[{ value: 'name', label: 'Nombre de la unidad' }]}
              sortOrderOptions={[
                { value: 'asc', label: 'Ascendente' },
                { value: 'desc', label: 'Descendente' },
              ]}
            />
          )}

          <div className="flex flex-col gap-8 lg:flex-row">
            {!loadError && (
              <div className={`${filtersVisible ? 'block' : 'hidden'} lg:block`}>
                <FilterSidebar
                  groups={filterGroups}
                  hasActiveFilters={hasActiveFilters}
                  onClearAll={clearFilters}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <UnitCardSkeleton key={i} />
                    ))}
                  </div>
                ) : loadError ? null : units.length > 0 ? (
                  <UnitsList units={units} />
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

          {!isLoading && !loadError && units.length > 0 && totalPages > 1 && (
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
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-brand-primary)] text-white shadow-lg transition-transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <ChevronUp size={20} strokeWidth={2} />
        </button>
      )}
    </main>
  );
}
