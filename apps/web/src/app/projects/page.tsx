import ProjectsViewClient from './components/ProjectsViewClient';
import type { ProjectQueryFilters } from '@/services/projects';

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

function parseFilterParam(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);

  const initialFilters: ProjectQueryFilters = {
    researchType: parseFilterParam(searchParams.researchType),
    projectType: parseFilterParam(searchParams.projectType),
    startYear: parseFilterParam(searchParams.startYear),
    status: parseFilterParam(searchParams.status),
    participants: parseFilterParam(searchParams.participants),
    keywords: parseFilterParam(searchParams.keywords),
  };

  return (
    <ProjectsViewClient
      initialProjects={[]}
      initialTotal={0}
      initialFilterOptions={null}
      initialSearchQuery={searchParams.q ?? ''}
      initialPage={page}
      initialFilters={initialFilters}
    />
  );
}
