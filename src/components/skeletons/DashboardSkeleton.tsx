import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background pt-16">
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
      {/* Tab bar */}
      <Skeleton className="mb-5 w-full h-11 rounded-xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="section-card p-5 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="section-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    </main>
  </div>
);

export default DashboardSkeleton;
