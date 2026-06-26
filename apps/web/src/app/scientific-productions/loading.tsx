'use client';

import PageHeroSearch from '@/components/PageHeroSearch';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';

const BREADCRUMB_ITEMS = [{ label: 'Producción científica' }];

function SidebarSkeleton() {
  return (
    <div className="w-56 shrink-0 space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-4 w-3/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function ScientificProductionsLoading() {
  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <PageHeroSearch
        items={BREADCRUMB_ITEMS}
        title="Producción científica"
        searchPlaceholder="Buscar por título"
        onSearch={() => undefined}
      />

      {/* Results skeleton */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-4 w-28 rounded mb-6" />
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="hidden lg:block">
              <SidebarSkeleton />
            </div>
            <div className="flex-1 space-y-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
