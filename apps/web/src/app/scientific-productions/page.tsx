// app/(public)/scientific-productions/page.tsx
import { getScientificProductions } from '@/services/scientific-productions';
import { ScientificProductionsView } from './components';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    type?: string;
    openAccess?: string;
    year?: string;
    keywords?: string;
  };
}

export default async function ScientificProductionsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const limit = Number(searchParams.limit ?? 10);
  const keywords = searchParams.keywords
    ? searchParams.keywords.split(',').map((k) => k.trim())
    : undefined;

  const response = await getScientificProductions({
    page,
    limit,
    q: searchParams.q,
    type: searchParams.type,
    openAccess: searchParams.openAccess === 'true' ? true : undefined,
    year: searchParams.year ? Number(searchParams.year) : undefined,
    keywords,
  });

  return (
    <ScientificProductionsView
      productions={response.items}
      total={response.total}
      currentPage={page}
      limit={limit}
      // para que el sidebar sepa qué filtros están activos al cargar
      activeFilters={{
        q: searchParams.q,
        type: searchParams.type,
        openAccess: searchParams.openAccess === 'true',
        year: searchParams.year ? Number(searchParams.year) : undefined,
        keywords: searchParams.keywords?.split(',') ?? [],
      }}
    />
  );
}
