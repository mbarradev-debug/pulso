function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-2 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-8 w-32" />
      </div>
      <div className="mb-6 rounded border border-border bg-surface p-6">
        <SkeletonBlock className="mb-4 h-4 w-40" />
        <SkeletonBlock className="mb-6 h-10 w-64" />
        <SkeletonBlock className="h-52 w-full" />
      </div>
      <div className="rounded border border-border bg-surface p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="mb-3 h-10 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
