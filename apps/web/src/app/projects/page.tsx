import ProjectsViewClient from './components/ProjectsViewClient';
import {
  getProjectFilters,
  getProjects,
  type ProjectFilters,
  type ProjectQueryFilters,
  type ProjectSummaryItem,
} from '@/services/projects';
import type { ProjectSortBy, ProjectSortOrder } from '@/types/projects.types';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    type?: string;
    researchType?: string;
    projectType?: string;
    startYear?: string;
    status?: string;
    participants?: string;
    keywords?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

const EMPTY_PROJECTS_RESPONSE: {
  data: ProjectSummaryItem[];
  total: number;
  page: number;
  limit: number;
} = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

const EMPTY_FILTER_OPTIONS: ProjectFilters = {
  researchType: [],
  projectType: [],
  startYear: [],
  status: [],
  participants: [],
  keywords: [],
};

function parseFilterParam(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSortBy(value?: string): ProjectSortBy {
  return value === 'year' || value === 'code' ? value : 'title';
}

function parseSortOrder(value?: string): ProjectSortOrder {
  return value === 'desc' ? 'desc' : 'asc';
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);

  const initialFilters: ProjectQueryFilters = {
    researchType: parseFilterParam(searchParams.type ?? searchParams.researchType),
    projectType: parseFilterParam(searchParams.projectType),
    startYear: parseFilterParam(searchParams.startYear),
    status: parseFilterParam(searchParams.status),
    participants: parseFilterParam(searchParams.participants),
    keywords: parseFilterParam(searchParams.keywords),
  };
  const initialSortBy = parseSortBy(searchParams.sortBy);
  const initialSortOrder = parseSortOrder(searchParams.sortOrder);

  const [projectsResult, filtersResult] = await Promise.allSettled([
    getProjects({
      page,
      limit,
      q: searchParams.q ?? '',
      filters: initialFilters,
      sort: {
        sortBy: initialSortBy,
        sortOrder: initialSortOrder,
      },
    }),
    getProjectFilters({
      q: searchParams.q ?? '',
      filters: initialFilters,
    }),
  ]);

  const projectsResponse =
    projectsResult.status === 'fulfilled'
      ? projectsResult.value
      : { ...EMPTY_PROJECTS_RESPONSE, page, limit };

  const filterOptions =
    filtersResult.status === 'fulfilled' ? filtersResult.value : EMPTY_FILTER_OPTIONS;

  const hasApiError =
    projectsResult.status === 'rejected' || filtersResult.status === 'rejected';

  if (projectsResult.status === 'rejected') {
    console.error('Error fetching projects:', projectsResult.reason);
  }

  if (filtersResult.status === 'rejected') {
    console.error('Error fetching project filters:', filtersResult.reason);
  }

  return (
    <ProjectsViewClient
      projects={projectsResponse.data}
      total={projectsResponse.total}
      currentPage={page}
      limit={limit}
      activeFilters={{
        q: searchParams.q,
        ...initialFilters,
      }}
      filterOptions={filterOptions}
      sortBy={initialSortBy}
      sortOrder={initialSortOrder}
      hasApiError={hasApiError}
    />
  );
}
