import { Skeleton } from "@/components/ui/skeleton";

const HistorySkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-9 w-full rounded-md" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    ))}
  </div>
);

export default HistorySkeleton;
