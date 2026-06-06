/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';
import ResearchersCardsGrid from './ResearchersCardsGrid';

import type { Researcher } from '@/types/researcher-data.js';

// Number of profiles displayed per page
const PAGE_SIZE = 18;

interface ResearchersListProps {
  searchQuery: string;
  filters: ResearcherQueryFilters;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalChange?: (total: number) => void;
  profileType?: 'UCR' | 'EXTERNAL';
}

export default function ResearchersList({
  searchQuery,
  filters,
  currentPage,
  onPageChange,
  onTotalChange,
  profileType,
}: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Fetches researchers whenever the page, search query, or filters change.
  // The cleanup function sets `cancelled = true` so that if the effect
  // re-runs before the previous fetch completes (e.g. when search and page
  // reset fire simultaneously), the stale response is discarded and does
  // NOT overwrite the state with outdated researcher cards.
  useEffect(() => {
    let cancelled = false;

    const fetchResearchers = async () => {
      setIsLoading(true);
      try {
        const response = await getResearchers(
          currentPage,
          PAGE_SIZE,
          searchQuery,
          filters.baseUnit,
          profileType,
          filters.collaborationCountry,
        );

        if (cancelled) return;

        setResearchers(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
        onTotalChange?.(response.total);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching researchers:', error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchResearchers();

    // Mark this fetch as stale when the effect re-runs
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, filters, profileType, onTotalChange]);

  const emptyMessage =
    !isLoading && researchers.length === 0
      ? searchQuery
        ? `No se encontraron perfiles para \`${searchQuery}\``
        : 'No se encontraron perfiles para los filtros aplicados'
      : null;

  const activeBaseUnits = (filters.baseUnit ?? []).map((unit) => unit.toLowerCase());

  return (
    <div className="flex flex-col gap-8">
      <ResearchersCardsGrid
        researchers={researchers}
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        activeBaseUnits={activeBaseUnits}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onCardClick={() =>
          sessionStorage.setItem('researchers-scroll-y', String(window.scrollY))
        }
      />

      {emptyMessage && (
        <p className="text-center text-base font-medium text-[var(--color-text-neutral-secondary)]">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
