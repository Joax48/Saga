export function CardSkeleton() {
  return (
    <div className="space-y-3 py-2">
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-3/5 rounded" />
      </div>
      <div className="skeleton h-4 w-2/5 rounded" />
      <div className="flex flex-wrap gap-2 pt-1">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function UnitCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="skeleton w-32 h-32 rounded-md" />
      <div className="skeleton h-4 w-28 rounded" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  );
}

export function ResearcherCardSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <div className="skeleton w-14 h-14 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}
