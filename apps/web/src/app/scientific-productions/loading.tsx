import { CardSkeleton } from '@/components/skeletons/CardSkeleton';

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
      {/* Hero skeleton */}
      <section className="px-6 lg:px-10 pt-4 pb-20 bg-[url('/ucr_hero_image.png')] bg-cover bg-center">
        <div className="flex justify-start h-14" />
        <div className="max-w-6xl mx-auto">
          <div className="pt-2 pb-4">
            <div className="skeleton h-4 w-36 rounded opacity-40" />
          </div>
          <div className="flex justify-start h-10" />
          <div className="skeleton h-10 w-56 rounded mx-auto opacity-40" />
          <div className="mt-6 skeleton h-12 w-full max-w-xl mx-auto rounded opacity-40" />
        </div>
        <div className="flex justify-start h-30" />
      </section>

      {/* Results skeleton */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 py-14">
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
