import { getProjectFilters, getProjects } from '@/services/projects';
import ProjectsViewClient from './components/ProjectsViewClient';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    researchType?: string;
    projectType?: string;
    startYear?: string;
    status?: string;
    participants?: string;
    keywords?: string;
  };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);

  // initial filters are empty; we can fetch filters based on that
  const initialFilters = {};

  const projectsResponse = await getProjects(
    page,
    limit,
    searchParams.q,
    initialFilters as any,
  );
  const filterOptions = await getProjectFilters(
    initialFilters as any,
    searchParams.q ?? '',
  );

  return (
    // render client view with initial data to avoid flash
    <ProjectsViewClient
      initialProjects={projectsResponse.data}
      initialTotal={projectsResponse.total}
      initialFilterOptions={filterOptions}
    />
  );
}
