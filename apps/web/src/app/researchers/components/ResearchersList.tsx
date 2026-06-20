/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';
import ResearchersCardsGrid from './ResearchersCardsGrid';
import ApiErrorMessage from '@/components/ApiErrorMessage';

import type { Researcher } from '@/types/researcher-list';

// Number of profiles displayed per page
const PAGE_SIZE = 18;

interface ResearchersListProps {
  searchQuery: string;
  filters: ResearcherQueryFilters;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalChange?: (total: number) => void;
  onLoadErrorChange?: (error: string | null) => void;
  onTotalPagesChange?: (totalPages: number) => void;
  onDataChange?: (items: Researcher[]) => void;
  profileType?: 'UCR' | 'EXTERNAL';
}

export default function ResearchersList({
  searchQuery,
  filters,
  currentPage,
  onPageChange,
  onTotalChange,
  onLoadErrorChange,
  onTotalPagesChange,
  onDataChange,
  profileType,
}: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    onLoadErrorChange?.(loadError);
  }, [loadError, onLoadErrorChange]);

  useEffect(() => {
    onTotalPagesChange?.(totalPages);
  }, [totalPages, onTotalPagesChange]);

  // Fetches researchers whenever the page, search query, or filters change.
  // The cleanup function sets `cancelled = true` so that if the effect
  // re-runs before the previous fetch completes (e.g. when search and page
  // reset fire simultaneously), the stale response is discarded and does
  // NOT overwrite the state with outdated researcher cards.
  useEffect(() => {
    let cancelled = false;

    const fetchResearchers = async () => {
      setIsLoading(true);
      setLoadError(null);
      onLoadErrorChange?.(null);
      try {
        const response = await getResearchers({
          page: currentPage,
          limit: PAGE_SIZE,
          q: searchQuery,
          filters: {
            baseUnit: filters.baseUnit,
            collaborationCountry: filters.collaborationCountry,
            profileType,
          },
          sort: { order: filters.sortOrder },
        });

        if (cancelled) return;

        setResearchers(response.data);
        onDataChange?.(response.data);
        const nextTotalPages = Math.max(1, Math.ceil(response.total / response.limit));
        setTotalPages(nextTotalPages);
        onTotalChange?.(response.total);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching researchers:', error);
          setResearchers([]);
          setTotalPages(1);
          onTotalChange?.(0);
          setLoadError(
            'No se pudieron cargar los perfiles. Intenta nuevamente más tarde.',
          );
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
  }, [currentPage, searchQuery, filters, profileType, onTotalChange, onLoadErrorChange]);

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
        showPagination={false}
      />

      {!onLoadErrorChange && loadError && <ApiErrorMessage message={loadError} />}

      {!loadError && emptyMessage && (
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
  );
}
