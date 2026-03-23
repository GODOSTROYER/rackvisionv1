import { Skeleton } from "@/components/ui/skeleton";

export function SiteOverviewSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-44" />
      <Skeleton className="h-36" />
      <Skeleton className="h-48" />
    </div>
  );
}
