import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-background pt-16">
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="section-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Photo upload area */}
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>

          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </main>
  </div>
);

export default ProfileSkeleton;
