'use client';

import { useState, useMemo, useCallback } from 'react';
import Pagination from '@/components/Pagination';
import { ProductionCard } from '@/app/scientific-productions/components';
import type { UnitScientificProduction } from '@/services/units';
import type { SummaryScientificProduction } from '@/types';

const PAGE_SIZE = 10;

function parseProduction(p: UnitScientificProduction): SummaryScientificProduction {
  const typeLabel = (() => {
    try {
      const parsed = JSON.parse(p.type);
      return parsed && typeof parsed === 'object' && parsed.category
        ? String(parsed.category)
        : p.type;
    } catch {
      return p.type;
    }
  })();

  return {
    id: p.id,
    title: p.title,
    authors: p.authors
      ? p.authors.split(';').map((name, index) => ({ id: index, name: name.trim() }))
      : [],
    type: typeLabel,
    open_access: false,
    publication_year: p.publicationYear,
    doi: p.doi ?? '',
    journal: p.journal ?? undefined,
    volume: p.volume ?? undefined,
    issue: p.issue ?? undefined,
    pages: p.pages ?? undefined,
    keywords: p.keywords
      ? p.keywords.split(',').map((value, index) => ({ id: index, value: value.trim() }))
      : [],
  };
}

interface UnitScientificProductionsTabProps {
  productions: UnitScientificProduction[];
}

export function UnitScientificProductionsTab({
  productions,
}: UnitScientificProductionsTabProps) {
  const [page, setPage] = useState(1);

  const parsed = useMemo(() => productions.map(parseProduction), [productions]);

  const totalPages = Math.max(1, Math.ceil(parsed.length / PAGE_SIZE));

  const paginated = useMemo(
    () => parsed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [parsed, page],
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (productions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium text-[var(--color-text-neutral-secondary)]">
          No hay producciones científicas asociadas a esta unidad.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p
        className="mb-4 text-sm"
        style={{ color: 'var(--color-text-neutral-secondary)' }}
      >
        {productions.length} resultado{productions.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-8">
        {paginated.map((production) => (
          <ProductionCard key={production.id} production={production} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
