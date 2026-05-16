'use client';

import { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';
import Card from '@/components/Card';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';

import type { Researcher } from '@/types/researcher-data.js';

// Number of researchers displayed per page
const PAGE_SIZE = 9;

interface ResearchersListProps {
  searchQuery: string;
  filters: ResearcherQueryFilters;
  /**
   * Optional callback invoked every time a new server response arrives
   * with the total result count. Used by the parent component (ResearchersPage)
   * to display the "X results" counter above the filter sidebar.
   */
  onTotalChange?: (total: number) => void;
}

export default function ResearchersList({
  searchQuery,
  filters,
  onTotalChange,
}: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Resets to page 1 whenever the search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Fetches researchers whenever the page, search query, or filters change.
  // The cleanup function sets `cancelled = true` so that if the effect
  // re-runs before the previous fetch completes (e.g. when search and page
  // reset fire simultaneously), the stale response is discarded and does
  // NOT overwrite the state with outdated researcher cards.
  useEffect(() => {
    let cancelled = false;

    const fetchResearchers = async () => {
      try {
        const response = await getResearchers(
          currentPage,
          PAGE_SIZE,
          searchQuery,
          filters.baseUnit,
        );

        if (cancelled) return;

        setResearchers(response.data);
        setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
        onTotalChange?.(response.total);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching researchers:', error);
        }
      }
    };

    fetchResearchers();

    // Mark this fetch as stale when the effect re-runs
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchQuery, filters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Generates an avatar URL with initials when the researcher has no photo.
   * Uses the external ui-avatars.com service with a blue background.
   */
  const getAvatarUrl = (name: string, surname: string): string => {
    const fullName = `${name} ${surname}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {researchers.map((researcher) => (
          <Card
            key={researcher.id}
            title={`${researcher.name} ${researcher.firstSurname}`}
            description={researcher.baseUnit}
            excerpt={researcher.ceaCategory || 'Investigador'}
            imageSrc={
              // Falls back to an initials avatar when no photo is stored in the DB
              researcher.photoUrl ||
              getAvatarUrl(researcher.name, researcher.firstSurname)
            }
            imageShape="circle"
            href={`/researchers/${researcher.id}`}
            chromeless
            className="flex items-start gap-4"
          />
        ))}
      </div>

      {researchers.length === 0 && searchQuery && (
        <p className="text-center text-gray-500">
          No se encontraron investigadores para `{searchQuery}`
        </p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
