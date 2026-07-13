import { Skeleton } from "@/components/ui/skeleton";

const IndexSkeleton = () => (
  <div className="min-h-screen bg-background pt-16 pb-8">
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <Skeleton className="h-12 w-80 rounded-xl" />
      </div>

      {/* Patient Info card */}
      <div className="section-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Clinical + Medicine grid */}
      <div className="rx-page-grid">
        {/* Clinical side */}
        <div className="section-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          ))}
        </div>

        {/* Medicine side */}
        <div className="section-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default IndexSkeleton;
