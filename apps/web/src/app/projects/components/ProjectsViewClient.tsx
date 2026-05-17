'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';

import PageHeroSearch from '@/components/PageHeroSearch';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import {
  FacetOption,
  FilterSidebar,
  type FilterGroupConfig,
} from '@/components/FilterSidebar';
import ProjectListItem from '@/app/projects/components/ProjectListItem';

import {
  getProjectFilters,
  getProjects,
  type ProjectSummaryItem,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/services/projects';

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
}

export default function ProjectsViewClient({
  initialProjects,
  initialTotal,
  initialFilterOptions,
}: Props) {
  const [projects, setProjects] = useState<ProjectSummaryItem[]>(initialProjects);
  const [totalResults, setTotalResults] = useState(initialTotal);
  const [filterOptions, setFilterOptions] = useState<ProjectFilters | null>(
    initialFilterOptions,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProjectQueryFilters>(DEFAULT_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    (key: keyof ProjectQueryFilters, value: string) => {
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
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const loadFilters = async () => {
      const options = await getProjectFilters(filters, searchQuery);
      setFilterOptions(options);
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
      try {
        const projectsResponse = await getProjects(
          currentPage,
          PAGE_SIZE,
          searchQuery,
          filters,
        );
        setProjects(projectsResponse.data);
        setTotalResults(projectsResponse.total);
        setTotalPages(
          Math.max(1, Math.ceil(projectsResponse.total / projectsResponse.limit)),
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, filters]);

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
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Proyectos"
        searchPlaceholder="Buscar por código, nombre o participante"
        onSearch={handleSearch}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-14 scroll-mt-10"
      >
        <div className="max-w-6xl mx-auto">
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

          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--color-text-neutral-secondary)' }}
          >
            {totalResults} resultado{totalResults !== 1 ? 's' : ''}
          </p>

          <div className="flex flex-col gap-8 lg:flex-row">
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

            <div className="flex-1 min-w-0">
              <div className="space-y-12">
                {projects.length > 0 ? (
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

                {projects.length > 0 ? (
                  <div className="pt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

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
