import ResearchersList from './components/ResearchersList';
import type { ResearcherQueryFilters } from '@/services/researchers';

// Server component: the URL is the single source of truth. It reads and
// normalizes the search params on the server and passes them down as the
// initial state, so deep links and bookmarks render with the right filters,
// search term, sort order and page already applied.
interface PageProps {
  searchParams: {
    page?: string;
    q?: string;
    unit?: string;
    collaborationCountry?: string;
    sort?: string;
  };
}

// Splits a comma-separated multi-value param (e.g. "unitA,unitB") into a
// trimmed string array, matching the convention used by the projects section.
function parseFilterParam(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// Normalizes the sort param, defaulting to ascending for any unknown value.
function parseSortOrder(value?: string): 'asc' | 'desc' {
  return value === 'desc' ? 'desc' : 'asc';
}

export default async function ResearchersPage({ searchParams }: PageProps) {
  // Default to page 1 for missing, non-numeric or out-of-range values.
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);

  const initialFilters: ResearcherQueryFilters = {
    baseUnit: parseFilterParam(searchParams.unit),
    collaborationCountry: parseFilterParam(searchParams.collaborationCountry),
    sortOrder: parseSortOrder(searchParams.sort),
  };

  return (
    <ResearchersList
      initialTotal={0}
      initialFilterOptions={null}
      initialSearchQuery={searchParams.q ?? ''}
      initialPage={page}
      initialFilters={initialFilters}
    />
  );
}
