'use client';

import Link from 'next/link';
import Pagination from '@/components/Pagination';
import Card from '@/components/Card';
import { ResearcherCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { formatCeaCategory } from '@/utils/text';
import type { Researcher } from '@/types/researcher-data';

interface ResearchersCardsGridProps {
  researchers: Researcher[];
  isLoading?: boolean;
  pageSize?: number;
  activeBaseUnits?: string[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCardClick?: () => void;
  showPagination?: boolean;
}

function getAvatarUrl(...nameParts: (string | null | undefined)[]): string {
  const fullName = nameParts.filter(Boolean).join(' ');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
}

function buildFullName(researcher: Researcher): string {
  return [researcher.name, researcher.firstSurname, researcher.secondSurname]
    .filter(Boolean)
    .join(' ');
}

function formatParticipationDate(value?: string): string | null {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export default function ResearchersCardsGrid({
  researchers,
  isLoading = false,
  pageSize = 18,
  activeBaseUnits = [],
  currentPage,
  totalPages,
  onPageChange,
  onCardClick,
  showPagination = true,
}: ResearchersCardsGridProps) {
  const cardsCount = isLoading ? pageSize : researchers.length;

  // Adapts the layout so a small result set fills the container width nicely
  // instead of leaving empty columns on the right.
  const layoutClass =
    cardsCount === 1
      ? 'grid grid-cols-1 gap-x-8 gap-y-10 items-stretch'
      : cardsCount === 2
        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 items-stretch'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 items-stretch';

  return (
    <div className="flex flex-col gap-8">
      <div className={layoutClass}>
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <ResearcherCardSkeleton key={i} />
            ))
          : researchers.map((researcher) => {
              const allWorkUnits = researcher.workUnits ?? [];
              // When filtering by unit, show the matched unit first so the card
              // always displays the unit the user is currently filtering by.
              const workUnits =
                activeBaseUnits.length > 0
                  ? [
                      ...allWorkUnits.filter((unit) =>
                        activeBaseUnits.includes(unit.name.toLowerCase()),
                      ),
                      ...allWorkUnits.filter(
                        (unit) => !activeBaseUnits.includes(unit.name.toLowerCase()),
                      ),
                    ]
                  : allWorkUnits;
              const primaryWorkUnit = workUnits[0];
              const extraWorkUnits = workUnits.slice(1);
              const participationStartDate = formatParticipationDate(
                researcher.participationStartDate,
              );
              const participationEndDate = formatParticipationDate(
                researcher.participationEndDate,
              );

              return (
                <Card
                  key={researcher.id}
                  onClick={onCardClick}
                  title={buildFullName(researcher)}
                  titleClassName="text-body-md-sm font-bold leading-snug text-[var(--color-text-neutral-title)]"
                  titleLinkClassName="after:absolute after:inset-0 after:z-[0]"
                  description={
                    <span className="flex flex-col gap-0.5">
                      <span
                        className="text-caption font-bold tracking-wide"
                        style={{ color: 'var(--color-text-neutral-secondary)' }}
                      >
                        {workUnits.length === 1 ? 'Unidad de Trabajo' : 'Unidades de Trabajo'}
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
                              <span className="inline-flex cursor-help items-center justify-center rounded-full bg-[var(--color-bg-brand-primary)] px-2 py-0.5 text-caption font-bold text-white">
                                +{extraWorkUnits.length}
                              </span>
                              <span
                                className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-xs rounded-md bg-gray-900 px-3 py-2 text-caption text-white shadow-lg group-hover:block"
                                role="tooltip"
                              >
                                <span className="mb-1 block font-bold">
                                  Todas las unidades de pago
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
                          Sin unidad de trabajo registrada
                        </span>
                      )}
                      {participationStartDate && (
                        <span
                          className="text-caption mt-1"
                          style={{ color: 'var(--color-text-neutral-tertiary)' }}
                        >
                          Participación: {participationStartDate}
                          {participationEndDate ? ` → ${participationEndDate}` : ''}
                        </span>
                      )}
                    </span>
                  }
                  excerpt={
                    formatCeaCategory(researcher.ceaCategory) ??
                    'Sin categoría registrada'
                  }
                  imageSrc={
                    researcher.photo ||
                    getAvatarUrl(
                      researcher.name,
                      researcher.firstSurname,
                      researcher.secondSurname,
                    )
                  }
                  imageShape="circle"
                  href={`/researchers/${researcher.id}`}
                  chromeless
                  className="flex items-start gap-4 h-full cursor-pointer"
                />
              );
            })}
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
