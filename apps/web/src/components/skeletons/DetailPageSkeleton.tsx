export function ResearcherDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-primary)]">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="mt-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="skeleton w-20 h-20 md:w-44 md:h-44 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-4 min-w-0">
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-4 w-2/5 rounded" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="skeleton w-8 h-8 rounded-md" />
                <div className="skeleton w-8 h-8 rounded-md" />
                <div className="skeleton w-8 h-8 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--color-bg-neutral-secondary)] h-16 px-6">
        <div className="max-w-7xl mx-auto flex gap-8 h-full items-center">
          <div className="skeleton h-5 w-28 rounded" />
          <div className="skeleton h-5 w-24 rounded" />
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton h-5 w-20 rounded" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="space-y-3">
          <div className="skeleton h-4 w-2/5 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-4 w-2/5 rounded" />
          <div className="skeleton h-4 w-1/4 rounded" />
        </div>
        <div className="skeleton h-6 w-40 rounded pt-4" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/5 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      </div>
    </main>
  );
}

export function DetailPageSkeleton() {
  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      {/* Header */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 pt-10 pb-18">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="skeleton h-4 w-44 rounded" />

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="skeleton h-9 w-4/5 rounded" />
              <div className="skeleton h-9 w-3/5 rounded" />
              <div className="skeleton h-5 w-2/5 rounded" />
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton h-5 w-1/4 rounded" />
            </div>

            <div className="hidden lg:block w-px bg-gray-300 self-stretch mx-2" />

            <div className="lg:w-55 shrink-0 space-y-4">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-14 w-24 mx-auto rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-[var(--color-bg-neutral-tertiary)] h-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex gap-12 h-full items-center">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton h-5 w-28 rounded" />
        </div>
      </div>

      {/* Content */}
      <section className="bg-[var(--color-bg-neutral-primary)] px-6 lg:px-10 pt-12 pb-12">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="skeleton h-7 w-32 rounded" />
          <div className="space-y-3">
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
          </div>
          <div className="pt-6 space-y-4">
            <div className="skeleton h-5 w-2/5 rounded" />
            <div className="skeleton h-5 w-1/3 rounded" />
            <div className="skeleton h-5 w-2/5 rounded" />
          </div>
        </div>
      </section>
    </main>
  );
}
