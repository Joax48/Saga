// app/(public)/scientific-productions/page.tsx
import {
  getScientificProductions,
  getScientificProductionFilters,
} from '@/services/scientific-productions';
import { ScientificProductionsView } from './components';
import type { FiltersApiResponse } from '@/services/scientific-productions';
import type { SummaryScientificProduction } from '@/types';

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    type?: string; // comma-separated: "Artículo,Libro"
    openAccess?: string;
    year?: string; // comma-separated: "2024,2023"
    keywords?: string; // comma-separated
    sortBy?: string;
    sortOrder?: string;
  };
}

const EMPTY_PRODUCTIONS_RESPONSE: {
  items: SummaryScientificProduction[];
  total: number;
} = {
  items: [],
  total: 0,
};

const EMPTY_FILTER_OPTIONS: FiltersApiResponse = {
  types: [],
  years: [],
  keywords: [],
  openAccessCount: 0,
};

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

  const sortBy: 'title' | 'publication_year' =
    searchParams.sortBy === 'title' || searchParams.sortBy === 'publication_year'
      ? searchParams.sortBy
      : 'publication_year';

  const sortOrder: 'asc' | 'desc' =
    searchParams.sortOrder === 'asc' || searchParams.sortOrder === 'desc'
      ? searchParams.sortOrder
      : 'desc';

  const filterParams = {
    q: searchParams.q,
    filters: {
      type,
      openAccess: searchParams.openAccess === 'true' ? true : undefined,
      year,
      keywords,
    },
    sort: {
      sortBy,
      sortOrder,
    },
  };

  const [productionsResult, filtersResult] = await Promise.allSettled([
    getScientificProductions({ page, limit, ...filterParams }),
    getScientificProductionFilters(filterParams),
  ]);

  const response =
    productionsResult.status === 'fulfilled'
      ? productionsResult.value
      : EMPTY_PRODUCTIONS_RESPONSE;

  const filterOptions =
    filtersResult.status === 'fulfilled' ? filtersResult.value : EMPTY_FILTER_OPTIONS;

  const hasApiError =
    productionsResult.status === 'rejected' || filtersResult.status === 'rejected';

  if (productionsResult.status === 'rejected') {
    console.error('Error fetching scientific productions:', productionsResult.reason);
  }

  if (filtersResult.status === 'rejected') {
    console.error('Error fetching scientific production filters:', filtersResult.reason);
  }

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
      sortBy={sortBy}
      sortOrder={sortOrder}
      hasApiError={hasApiError}
    />
  );
}
