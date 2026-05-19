'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Card from '@/components/Card';
import {
  getResearchers,
  type ResearcherQueryFilters,
} from '../../../services/researchers';

import type { Researcher } from '@/types/researcher-data.js';

// Number of profiles displayed per page
const PAGE_SIZE = 18;

interface ResearchersListProps {
  searchQuery: string;
  filters: ResearcherQueryFilters;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalChange?: (total: number) => void;
}

export default function ResearchersList({
  searchQuery,
  filters,
  currentPage,
  onPageChange,
  onTotalChange,
}: ResearchersListProps) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  // Saved scroll position at the moment the user clicks a page button.
  // Restored after the new page content paints so the pagination stays visible.
  const savedScrollY = useRef<number | null>(null);

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

        // After React paints the new content, restore the scroll position the
        // user was at when they clicked the page button so the pagination bar
        // stays on screen and they can keep navigating without scrolling.
        if (savedScrollY.current !== null) {
          const y = savedScrollY.current;
          savedScrollY.current = null;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              window.scrollTo({ top: y, behavior: 'instant' });
            });
          });
        }
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
    savedScrollY.current = window.scrollY;
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
      ? 'grid grid-cols-1 gap-x-8 gap-y-6 items-stretch'
      : researchers.length === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-stretch'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 items-stretch';

  return (
    <div className="flex flex-col gap-8">
      <div className={layoutClass}>
        {researchers.map((researcher) => {
          const hasBaseUnit = !!researcher.baseUnit;

          // If the researcher has a base unit, show it under "Unidad base".
          // Otherwise fall back to linked units under "Unidades asociadas".
          const linkedUnits = researcher.linkedUnits ?? [];
          const fallbackUnits = linkedUnits.length > 0 ? linkedUnits : [];
          const primaryFallback = fallbackUnits[0];
          const extraFallback = fallbackUnits.slice(1);

          return (
            <Card
              key={researcher.id}
              title={buildFullName(researcher)}
              titleClassName="text-sm font-bold leading-snug"
              description={
                <span className="flex flex-col gap-0.5">
                  {hasBaseUnit ? (
                    // ── Has base unit: show it with "Unidad base" label ──────
                    <>
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        Unidad base
                      </span>
                      <Link
                        href={`/units?q=${encodeURIComponent(researcher.baseUnit!)}`}
                        className="hover:underline"
                        style={{ color: 'var(--color-text-brand-primary)' }}
                      >
                        {researcher.baseUnit}
                      </Link>
                    </>
                  ) : (
                    // ── No base unit: show linked units ──────────────────────
                    <>
                      <span
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        Unidades asociadas
                      </span>
                      {primaryFallback ? (
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/units?q=${encodeURIComponent(primaryFallback.name)}`}
                            className="hover:underline"
                            style={{ color: 'var(--color-text-brand-primary)' }}
                          >
                            {primaryFallback.name}
                          </Link>
                          {extraFallback.length > 0 && (
                            <span className="group relative inline-block">
                              <span
                                className="inline-flex cursor-help items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                style={{
                                  backgroundColor: 'var(--color-bg-brand-primary)',
                                }}
                              >
                                +{extraFallback.length}
                              </span>
                              <span
                                className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block"
                                role="tooltip"
                              >
                                <span className="mb-1 block font-semibold">
                                  Todas las unidades asociadas
                                </span>
                                <ul className="space-y-0.5">
                                  {fallbackUnits.map((u) => (
                                    <li key={u.id}>• {u.name}</li>
                                  ))}
                                </ul>
                              </span>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-neutral-secondary)' }}>
                          Sin unidades registradas
                        </span>
                      )}
                    </>
                  )}
                </span>
              }
              excerpt={researcher.ceaCategory || 'Sin categoría registrada'}
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
              className="flex items-start gap-4 h-full"
            />
          );
        })}
      </div>

      {researchers.length === 0 && searchQuery && (
        <p className="text-center text-gray-500">
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
