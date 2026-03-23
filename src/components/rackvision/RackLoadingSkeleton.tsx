import { Skeleton } from "@/components/ui/skeleton";

export function RackLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16" />
      <Skeleton className="h-12" />
      <div className="grid gap-3 md:grid-cols-[56px_minmax(0,1fr)]">
        <Skeleton className="h-[760px]" />
        <Skeleton className="h-[760px]" />
      </div>
    </div>
  );
}
