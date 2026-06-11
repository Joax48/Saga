'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { SortControls } from '@/components/SortControls';
import {
  FacetOption,
  FilterSidebar,
  type FilterGroupConfig,
} from '@/components/FilterSidebar';
import ProjectListItem from '@/app/projects/components/ProjectListItem';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';

import {
  getProjectFilters,
  getProjects,
  type ProjectSummaryItem,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/services/projects';
import type { ProjectSortBy, ProjectSortOrder } from '@/types/projects.types';

const PAGE_SIZE = 10;
const BREADCRUMB_ITEMS = [{ label: 'Proyectos' }];

const DEFAULT_FILTERS: ProjectQueryFilters = {
  researchType: [],
  projectType: [],
  startYear: [],
  status: [],
  participants: [],
  keywords: [],
};

const DEFAULT_SORT_BY: ProjectSortBy = 'title';
const DEFAULT_SORT_ORDER: ProjectSortOrder = 'asc';

type ProjectFilterKey = Exclude<keyof ProjectQueryFilters, 'sortBy' | 'sortOrder'>;

function toggleValue(values: string[] | undefined, value: string): string[] {
  const currentValues = values ?? [];
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

function keepSelectedOptionsVisible(
  options: FacetOption[] | undefined,
  selectedValues: string[] | undefined,
): FacetOption[] {
  const currentOptions = options ?? [];
  const selected = selectedValues ?? [];
  const existingValues = new Set(currentOptions.map((option) => option.value));
  const missingSelectedOptions = selected
    .filter((value) => !existingValues.has(value))
    .map((value) => ({
      value,
      label: value,
      count: 0,
    }));

  return [...currentOptions, ...missingSelectedOptions];
}

interface Props {
  initialProjects: ProjectSummaryItem[];
  initialTotal: number;
  initialFilterOptions: ProjectFilters | null;
  initialSearchQuery: string;
  initialPage: number;
  initialFilters: ProjectQueryFilters;
  initialSortBy: ProjectSortBy;
  initialSortOrder: ProjectSortOrder;
}

export default function ProjectsViewClient({
  initialProjects,
  initialTotal,
  initialFilterOptions,
  initialSearchQuery,
  initialPage,
  initialFilters,
  initialSortBy,
  initialSortOrder,
}: Props) {
  const [projects, setProjects] = useState<ProjectSummaryItem[]>(initialProjects);
  const [totalResults, setTotalResults] = useState(initialTotal);
  const [filterOptions, setFilterOptions] = useState<ProjectFilters | null>(
    initialFilterOptions,
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filters, setFilters] = useState<ProjectQueryFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<ProjectSortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>(initialSortOrder);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(
    Math.max(1, Math.ceil(initialTotal / PAGE_SIZE)),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      scrollToResults();
    },
    [scrollToResults],
  );

  const handleToggleFilter = useCallback(
    (key: ProjectFilterKey, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: toggleValue(prev[key], value),
      }));
      setCurrentPage(1);
      scrollToResults();
    },
    [scrollToResults],
  );

  const handleClearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSortBy(DEFAULT_SORT_BY);
    setSortOrder(DEFAULT_SORT_ORDER);
    setCurrentPage(1);
  }, []);

  const handleSortByChange = useCallback(
    (value: ProjectSortBy) => {
      setSortBy(value);
      setCurrentPage(1);
      scrollToResults();
    },
    [scrollToResults],
  );

  const handleSortOrderChange = useCallback(
    (value: ProjectSortOrder) => {
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
    const loadFilters = async () => {
      try {
        const options = await getProjectFilters(filters, searchQuery);
        setFilterOptions(options);
      } catch (error) {
        console.error('Error loading project filters:', error);
      }
    };

    loadFilters();
  }, [filters, searchQuery]);

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
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const projectsResponse = await getProjects(currentPage, PAGE_SIZE, searchQuery, {
          ...filters,
          sortBy,
          sortOrder,
        });
        setProjects(projectsResponse.data);
        setTotalResults(projectsResponse.total);
        setTotalPages(
          Math.max(1, Math.ceil(projectsResponse.total / projectsResponse.limit)),
        );
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        setTotalResults(0);
        setTotalPages(1);
        setLoadError(
          'No se pudieron cargar los proyectos. Intenta nuevamente más tarde.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, filters, sortBy, sortOrder]);

  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    if (!filterOptions) return [];

    return [
      {
        kind: 'options',
        title: 'Tipo de investigación',
        groupKey: 'research-type',
        options: keepSelectedOptionsVisible(
          filterOptions.researchType,
          filters.researchType,
        ),
        selectedValues: filters.researchType ?? [],
        onToggle: (value) => handleToggleFilter('researchType', value),
      },
      {
        kind: 'options',
        title: 'Tipo de acción',
        groupKey: 'project-type',
        options: keepSelectedOptionsVisible(
          filterOptions.projectType,
          filters.projectType,
        ),
        selectedValues: filters.projectType ?? [],
        onToggle: (value) => handleToggleFilter('projectType', value),
      },
      {
        kind: 'options',
        title: 'Años de inicio',
        groupKey: 'start-year',
        options: keepSelectedOptionsVisible(filterOptions.startYear, filters.startYear),
        selectedValues: filters.startYear ?? [],
        onToggle: (value) => handleToggleFilter('startYear', value),
      },
      {
        kind: 'options',
        title: 'Estado',
        groupKey: 'status',
        options: keepSelectedOptionsVisible(filterOptions.status, filters.status),
        selectedValues: filters.status ?? [],
        onToggle: (value) => handleToggleFilter('status', value),
      },
      {
        kind: 'options',
        title: 'Participantes',
        groupKey: 'participants',
        options: keepSelectedOptionsVisible(
          filterOptions.participants,
          filters.participants,
        ),
        selectedValues: filters.participants ?? [],
        onToggle: (value) => handleToggleFilter('participants', value),
      },
      {
        kind: 'options',
        title: 'Palabras clave',
        groupKey: 'keywords',
        options: keepSelectedOptionsVisible(filterOptions.keywords, filters.keywords),
        selectedValues: filters.keywords ?? [],
        onToggle: (value) => handleToggleFilter('keywords', value),
      },
    ];
  }, [filterOptions, filters, handleToggleFilter]);

  const hasActiveFilters =
    (filters.researchType?.length ?? 0) > 0 ||
    (filters.projectType?.length ?? 0) > 0 ||
    (filters.startYear?.length ?? 0) > 0 ||
    (filters.status?.length ?? 0) > 0 ||
    (filters.participants?.length ?? 0) > 0 ||
    (filters.keywords?.length ?? 0) > 0;

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen flex flex-col">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Proyectos"
        searchPlaceholder="Buscar por código o nombre del proyecto"
        onSearch={handleSearch}
        initialSearchValue={initialSearchQuery}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-14 scroll-mt-10 flex-1"
      >
        <div className="max-w-6xl mx-auto">
          {!loadError && (
            <div className="mb-4 lg:hidden">
              <Button
                variant="brandOutline"
                size="sm"
                onClick={() => setFiltersVisible((prev) => !prev)}
                aria-expanded={filtersVisible}
                aria-controls="projects-filter-sidebar"
              >
                {filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
            </div>
          )}

          {!loadError && (
            <p
              className="mb-4 text-body-md"
              style={{ color: 'var(--color-text-neutral-secondary)' }}
            >
              {totalResults} resultado{totalResults !== 1 ? 's' : ''}
            </p>
          )}

          {loadError && <ApiErrorMessage className="mb-6" message={loadError} />}

          {!loadError && (
            <SortControls
              className="mb-4"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
              sortByOptions={[
                { value: 'title', label: 'Título del proyecto' },
                { value: 'year', label: 'Año del proyecto' },
                { value: 'code', label: 'Código del proyecto' },
              ]}
              sortOrderOptions={[
                { value: 'asc', label: 'Ascendente' },
                { value: 'desc', label: 'Descendente' },
              ]}
            />
          )}

          <div className="flex flex-col gap-8 lg:flex-row">
            {!loadError && (
              <div
                id="projects-filter-sidebar"
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
              <div className="space-y-12">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                ) : loadError ? null : projects.length > 0 ? (
                  projects.map((project) => {
                    const managerProfile = project.associatedProfiles.find(
                      (profile: { id: string; name: string; role?: string }) =>
                        profile.name === project.manager,
                    );

                    return (
                      <ProjectListItem
                        key={project.id}
                        code={project.code}
                        title={project.title}
                        href={`/projects/${project.id}`}
                        manager={project.manager}
                        managerHref={
                          managerProfile
                            ? `/researchers/${managerProfile.id}`
                            : `/researchers?q=${encodeURIComponent(project.manager)}`
                        }
                        startDate={project.startDate}
                        endDate={project.endDate}
                        researchType={project.researchType}
                        actionType={project.projectType}
                        keywords={project.keywords}
                      />
                    );
                  })
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

          {!isLoading && !loadError && projects.length > 0 && totalPages > 1 && (
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
