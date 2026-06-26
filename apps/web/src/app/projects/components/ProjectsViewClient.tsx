'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  type ProjectSummaryItem,
  type ProjectFilters,
  type ProjectQueryFilters,
} from '@/services/projects';
import type { ProjectSortBy, ProjectSortOrder } from '@/types/projects.types';

const BREADCRUMB_ITEMS = [{ label: 'Proyectos' }];

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
  projects: ProjectSummaryItem[];
  total: number;
  currentPage: number;
  limit: number;
  activeFilters: ProjectQueryFilters & { q?: string };
  filterOptions: ProjectFilters;
  sortBy: ProjectSortBy;
  sortOrder: ProjectSortOrder;
  hasApiError?: boolean;
}

export default function ProjectsViewClient({
  projects,
  total,
  currentPage,
  limit,
  activeFilters,
  filterOptions,
  sortBy,
  sortOrder,
  hasApiError = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersVisible, setFiltersVisible] = useState(false);
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
        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        mode === 'replace'
          ? router.replace(url, { scroll: false })
          : router.push(url, { scroll: false });

        router.refresh();
      });
    },
    [pathname, router, searchParams],
  );

  const handleSearch = useCallback(
    (query: string) => {
      updateParams({ q: query || null });
      scrollToResults();
    },
    [scrollToResults, updateParams],
  );

  const handleToggleFilter = useCallback(
    (key: ProjectFilterKey, value: string) => {
      const updated = toggleValue(activeFilters[key], value);
      const urlKey = key === 'researchType' ? 'type' : key;
      updateParams({
        [urlKey]: updated.length > 0 ? updated.join(',') : null,
        ...(key === 'researchType' ? { researchType: null } : {}),
      });
      scrollToResults();
    },
    [activeFilters, scrollToResults, updateParams],
  );

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      router.refresh();
    });
  }, [pathname, router]);

  const handleSortByChange = useCallback(
    (value: ProjectSortBy) => {
      updateParams({ sortBy: value });
      scrollToResults();
    },
    [scrollToResults, updateParams],
  );

  const handleSortOrderChange = useCallback(
    (value: ProjectSortOrder) => {
      updateParams({ sortOrder: value });
      scrollToResults();
    },
    [scrollToResults, updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: String(page) }, false);
      scrollToResults();
    },
    [scrollToResults, updateParams],
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

  const filterGroups = useMemo<FilterGroupConfig[]>(() => {
    return [
      {
        kind: 'options',
        title: 'Tipo de investigación',
        groupKey: 'research-type',
        options: keepSelectedOptionsVisible(
          filterOptions.researchType,
          activeFilters.researchType,
        ),
        selectedValues: activeFilters.researchType ?? [],
        onToggle: (value) => handleToggleFilter('researchType', value),
      },
      {
        kind: 'options',
        title: 'Tipo de acción',
        groupKey: 'project-type',
        options: keepSelectedOptionsVisible(
          filterOptions.projectType,
          activeFilters.projectType,
        ),
        selectedValues: activeFilters.projectType ?? [],
        onToggle: (value) => handleToggleFilter('projectType', value),
      },
      {
        kind: 'options',
        title: 'Años de inicio',
        groupKey: 'start-year',
        options: keepSelectedOptionsVisible(
          filterOptions.startYear,
          activeFilters.startYear,
        ),
        selectedValues: activeFilters.startYear ?? [],
        onToggle: (value) => handleToggleFilter('startYear', value),
      },
      {
        kind: 'options',
        title: 'Estado',
        groupKey: 'status',
        options: keepSelectedOptionsVisible(filterOptions.status, activeFilters.status),
        selectedValues: activeFilters.status ?? [],
        onToggle: (value) => handleToggleFilter('status', value),
      },
      {
        kind: 'options',
        title: 'Participantes',
        groupKey: 'participants',
        options: keepSelectedOptionsVisible(
          filterOptions.participants,
          activeFilters.participants,
        ),
        selectedValues: activeFilters.participants ?? [],
        onToggle: (value) => handleToggleFilter('participants', value),
      },
      {
        kind: 'options',
        title: 'Palabras clave',
        groupKey: 'keywords',
        options: keepSelectedOptionsVisible(
          filterOptions.keywords,
          activeFilters.keywords,
        ),
        selectedValues: activeFilters.keywords ?? [],
        onToggle: (value) => handleToggleFilter('keywords', value),
      },
    ];
  }, [activeFilters, filterOptions, handleToggleFilter]);

  const hasActiveFilters =
    !!activeFilters.q ||
    (activeFilters.researchType?.length ?? 0) > 0 ||
    (activeFilters.projectType?.length ?? 0) > 0 ||
    (activeFilters.startYear?.length ?? 0) > 0 ||
    (activeFilters.status?.length ?? 0) > 0 ||
    (activeFilters.participants?.length ?? 0) > 0 ||
    (activeFilters.keywords?.length ?? 0) > 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen flex flex-col">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Proyectos"
        searchPlaceholder="Buscar por código o nombre del proyecto"
        onSearch={handleSearch}
        initialSearchValue={activeFilters.q ?? ''}
      />

      <section
        ref={resultsRef}
        className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-8 scroll-mt-10 flex-1"
      >
        <div className="max-w-6xl mx-auto">
          {!hasApiError && (
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
              message="No se pudieron cargar los proyectos. Intenta nuevamente más tarde."
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
            {!hasApiError && (
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
              <div className="space-y-8">
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                ) : hasApiError ? null : projects.length > 0 ? (
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
                        href={`/projects/${encodeURIComponent(project.id)}`}
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

          {!isPending && !hasApiError && projects.length > 0 && totalPages > 1 && (
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
