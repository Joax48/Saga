/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Card from '@/components/Card';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';
import { ResearcherCardSkeleton } from '@/components/skeletons/CardSkeleton';

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
  }, [currentPage, searchQuery, filters, profileType]);

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  /**
   * Generates an avatar URL with initials when the researcher has no photo.
   * Uses the external ui-avatars.com service with a blue background.
   */
  const getAvatarUrl = (...nameParts: (string | null | undefined)[]): string => {
    const fullName = nameParts.filter(Boolean).join(' ');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
  };

  const buildFullName = (researcher: Researcher): string =>
    [researcher.name, researcher.firstSurname, researcher.secondSurname]
      .filter(Boolean)
      .join(' ');

  // Adapts the layout so a small result set fills the container width nicely
  // instead of leaving empty columns on the right.
  const layoutClass =
    researchers.length === 1
      ? 'grid grid-cols-1 gap-x-8 gap-y-10 items-stretch'
      : researchers.length === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 items-stretch'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 items-stretch';

  return (
    <div className="flex flex-col gap-8">
      <div className={layoutClass}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ResearcherCardSkeleton key={i} />
            ))
          : researchers.map((researcher) => {
              const workUnits = researcher.workUnits ?? [];
              const primaryWorkUnit = workUnits[0];
              const extraWorkUnits = workUnits.slice(1);

              // External profile branches temporarily disabled — list is UCR-only.
              // const isExternal = researcher.profileType === 'EXTERNAL';

              return (
                <Card
                  key={researcher.id}
                  onClick={() =>
                    sessionStorage.setItem('researchers-scroll-y', String(window.scrollY))
                  }
                  title={buildFullName(researcher)}
                  titleClassName="text-sm font-bold leading-snug text-[var(--color-text-neutral-primary)]"
                  titleLinkClassName="after:absolute after:inset-0 after:z-[0]"
                  description={
                    <span className="flex flex-col gap-0.5">
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        {workUnits.length === 1 ? 'Unidad base' : 'Unidades base'}
                      </span>
                      {primaryWorkUnit ? (
                        <span className="relative z-[1] inline-flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/units?q=${encodeURIComponent(primaryWorkUnit.name)}`}
                            className="hover:underline"
                            style={{ color: 'var(--color-text-brand-primary)' }}
                          >
                            {primaryWorkUnit.name}
                          </Link>
                          {extraWorkUnits.length > 0 && (
                            <span className="group relative z-[1] inline-block">
                              <span
                                className="inline-flex cursor-help items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                style={{ backgroundColor: 'var(--color-bg-brand-primary)' }}
                              >
                                +{extraWorkUnits.length}
                              </span>
                              <span
                                className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block"
                                role="tooltip"
                              >
                                <span className="mb-1 block font-semibold">
                                  Todas las unidades base
                                </span>
                                <ul className="space-y-0.5">
                                  {workUnits.map((u) => (
                                    <li key={u.id}>• {u.name}</li>
                                  ))}
                                </ul>
                              </span>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                          Sin unidad base registrada
                        </span>
                      )}
                    </span>
                  }
                  excerpt={researcher.ceaCategory ?? 'Sin categoría registrada'}
                  imageSrc={
                    // Falls back to an initials avatar when no photo is stored in the DB
                    researcher.photoUrl ||
                    getAvatarUrl(
                      researcher.name,
                      researcher.firstSurname,
                      researcher.secondSurname,
                    )
                  }
                  imageShape="circle"
                  href={`/researchers/${researcher.id}`}
                  chromeless
                  className="relative z-0 hover:z-10 flex items-start gap-4 h-full transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                />
              );
            })}
      </div>

      {!isLoading && researchers.length === 0 && searchQuery && (
        <p className="text-center text-base font-medium text-[var(--color-text-neutral-secondary)]">
          No se encontraron perfiles para `{searchQuery}`
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
