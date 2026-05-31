'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { ResearcherScientificOutput } from '../../../types/researcher-profile';

interface MetricsPanelProps {
  scientificOutputs: ResearcherScientificOutput[];
  onYearSelected?: (year: number | null) => void;
  // Precomputed h-index from the backend (UCR_PROFILE_METRIC). When provided
  // it takes precedence over the value calculated from citation counts. Most
  // profiles will have null here (the table is sparsely populated), in which
  // case the panel falls back to the in-memory calculation.
  hIndex?: number | null;
}

/**
 * Standard h-index: the largest n such that the author has at least n
 * publications, each cited at least n times. Null citation counts are
 * treated as 0 (uncited).
 */
function calculateHIndex(citationCounts: number[]): number {
  const sorted = [...citationCounts].sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) h = i + 1;
    else break;
  }
  return h;
}

type YearBucket = { year: number; count: number };

/**
 * Returns one bucket per year between the first and last publication year,
 * filling missing years with 0 so the chart shows continuous columns.
 */
function buildPublicationsByYear(outputs: ResearcherScientificOutput[]): YearBucket[] {
  const counts = new Map<number, number>();
  for (const output of outputs) {
    const year = output.publicationYear;
    if (!year || year <= 0) continue;
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  if (counts.size === 0) return [];

  const years = [...counts.keys()];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const buckets: YearBucket[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    buckets.push({ year: y, count: counts.get(y) ?? 0 });
  }
  return buckets;
}

export default function MetricsPanel({
  scientificOutputs,
  onYearSelected,
  hIndex: hIndexFromBackend,
}: MetricsPanelProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearClick = (year: number) => {
    const newSelected = selectedYear === year ? null : year;
    setSelectedYear(newSelected);
    onYearSelected?.(newSelected);
  };

  const citationCounts = scientificOutputs.map((o) => o.citationCount ?? 0);
  const totalCitations = citationCounts.reduce((sum, c) => sum + c, 0);
  // Prefer the precomputed value from the backend; fall back to the locally
  // computed h-index when the backend has no row for this profile.
  const hIndex = hIndexFromBackend ?? calculateHIndex(citationCounts);
  const yearBuckets = buildPublicationsByYear(scientificOutputs);
  const maxYearCount = yearBuckets.reduce((max, b) => Math.max(max, b.count), 0);

  return (
    <aside
      className="w-full lg:w-72 lg:shrink-0 lg:border-l lg:border-[var(--color-border-neutral-secondary)] lg:pl-6 pt-1"
      aria-label="Métricas del investigador"
    >
      <h2 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)] mb-3">
        Métricas
      </h2>

      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-[var(--color-text-neutral-secondary)]">
            h-index
          </p>
          <div className="relative group">
            <Info
              size={14}
              className="text-[var(--color-text-neutral-secondary)] cursor-help"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-md bg-[var(--color-text-neutral-primary)] text-[var(--color-bg-neutral-primary)] text-xs leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
              El h-index es un indicador que combina productividad e impacto científico.
              Un investigador tiene índice h igual a{' '}
              <span className="font-semibold">h</span> cuando posee al menos{' '}
              <span className="font-semibold">h</span> publicaciones que han recibido{' '}
              <span className="font-semibold">h</span> o más citas cada una.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-text-neutral-primary)]" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <div className="relative flex-1 rounded-md bg-[var(--color-bg-neutral-secondary)] px-3 py-2 text-center">
            <div className="absolute top-1.5 right-1.5 group">
              <Info
                size={12}
                className="text-[var(--color-text-neutral-secondary)] cursor-help"
              />
              <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 rounded-md bg-[var(--color-text-neutral-primary)] text-[var(--color-bg-neutral-primary)] text-xs leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 text-left">
                <span className="font-semibold">Calculado por la aplicación</span> sumando
                las citas de cada publicación obtenidas desde Scopus.
                <div className="absolute top-full right-1.5 border-4 border-transparent border-t-[var(--color-text-neutral-primary)]" />
              </div>
            </div>
            <p className="text-xl font-medium text-[var(--color-text-neutral-primary)]">
              {totalCitations}
            </p>
            <p className="text-xs text-[var(--color-text-neutral-secondary)]">Citas</p>
          </div>
          <div className="relative flex-1 rounded-md bg-[var(--color-bg-neutral-secondary)] px-3 py-2 text-center">
            <div className="absolute top-1.5 right-1.5 group">
              <Info
                size={12}
                className="text-[var(--color-text-neutral-secondary)] cursor-help"
              />
              <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 rounded-md bg-[var(--color-text-neutral-primary)] text-[var(--color-bg-neutral-primary)] text-xs leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 text-left">
                {hIndexFromBackend != null ? (
                  <>
                    <span className="font-semibold">Obtenido desde Scopus</span> a través
                    del perfil institucional del investigador.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Calculado por la aplicación</span> a
                    partir de las citas por publicación obtenidas desde Scopus.
                  </>
                )}
                <div className="absolute top-full right-1.5 border-4 border-transparent border-t-[var(--color-text-neutral-primary)]" />
              </div>
            </div>
            <p className="text-xl font-medium text-[var(--color-text-neutral-primary)]">
              {hIndex}
            </p>
            <p className="text-xs text-[var(--color-text-neutral-secondary)]">h-index</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-1.5 mb-2">
          <p className="text-sm text-[var(--color-text-neutral-secondary)]">
            Cantidad de publicaciones por año
          </p>
          <div className="relative group">
            <Info
              size={14}
              className="text-[var(--color-text-neutral-secondary)] cursor-help"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-md bg-[var(--color-text-neutral-primary)] text-[var(--color-bg-neutral-primary)] text-xs leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-10 text-left">
              <span className="font-semibold">Calculado por la aplicación</span> agrupando
              por año las publicaciones del investigador obtenidas desde Scopus.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--color-text-neutral-primary)]" />
            </div>
          </div>
        </div>
        {yearBuckets.length === 0 ? (
          <p className="text-xs text-[var(--color-text-neutral-secondary)] italic">
            Sin publicaciones registradas
          </p>
        ) : yearBuckets.length < 3 ? (
          <div className="space-y-2">
            {yearBuckets.map((bucket) => (
              <div
                key={bucket.year}
                className="flex items-center justify-between gap-3 p-2 rounded-md bg-[var(--color-bg-neutral-secondary)]"
              >
                <span className="text-sm font-medium text-[var(--color-text-neutral-primary)]">
                  {bucket.year}
                </span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-text-neutral-primary)] text-xs font-semibold text-[var(--color-bg-neutral-secondary)]">
                    {bucket.count}
                  </span>
                  <span className="text-xs text-[var(--color-text-neutral-secondary)]">
                    {bucket.count === 1 ? 'publicación' : 'publicaciones'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="flex items-end gap-0.5 h-16"
              role="img"
              aria-label={`Publicaciones por año desde ${yearBuckets[0].year} hasta ${yearBuckets[yearBuckets.length - 1].year}`}
            >
              {yearBuckets.map((bucket) => {
                const heightPct =
                  maxYearCount === 0
                    ? 0
                    : Math.max(2, (bucket.count / maxYearCount) * 100);
                const isHovered = hoveredYear === bucket.year;
                const isSelected = selectedYear === bucket.year;
                const isActive = isHovered || isSelected;

                return (
                  <div
                    key={bucket.year}
                    className="flex-1 rounded-sm transition-all duration-150 cursor-pointer origin-bottom"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: 'var(--color-primary)',
                      opacity: isSelected ? 1 : isHovered ? 0.75 : 0.3,
                      transform: isHovered ? 'scaleY(1.15)' : 'scaleY(1)',
                    }}
                    onMouseEnter={() => setHoveredYear(bucket.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => handleYearClick(bucket.year)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    title={`${bucket.year}: ${bucket.count} ${bucket.count === 1 ? 'publicación' : 'publicaciones'}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[var(--color-text-neutral-secondary)]">
              <span>{yearBuckets[0].year}</span>
              <span>{yearBuckets[yearBuckets.length - 1].year}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
