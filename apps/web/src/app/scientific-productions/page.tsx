// app/(public)/scientific-productions/page.tsx
import {
  getScientificProductions,
  getScientificProductionFilters,
} from '@/services/scientific-productions';
import { ScientificProductionsView } from './components';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    type?: string; // comma-separated: "Artículo,Libro"
    openAccess?: string;
    year?: string; // comma-separated: "2024,2023"
    keywords?: string; // comma-separated
  };
}

export default async function ScientificProductionsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);

  const type = searchParams.type
    ? searchParams.type.split(',').map((t) => t.trim())
    : undefined;

  const year = searchParams.year
    ? searchParams.year.split(',').map((y) => y.trim())
    : undefined;

  const keywords = searchParams.keywords
    ? searchParams.keywords.split(',').map((k) => k.trim())
    : undefined;

  const filterParams = {
    q: searchParams.q,
    type,
    openAccess: searchParams.openAccess === 'true' ? true : undefined,
    year,
    keywords,
  };

  const [response, filterOptions] = await Promise.all([
    getScientificProductions({ page, limit, ...filterParams }),
    getScientificProductionFilters(filterParams),
  ]);

  return (
    <ScientificProductionsView
      productions={response.items}
      total={response.total}
      currentPage={page}
      limit={limit}
      activeFilters={{
        q: searchParams.q,
        type,
        openAccess: searchParams.openAccess === 'true',
        year,
        keywords: keywords ?? [],
      }}
      filterOptions={filterOptions}
    />
  );
}
