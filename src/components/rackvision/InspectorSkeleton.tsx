import { Skeleton } from "@/components/ui/skeleton";

export function InspectorSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10" />
      <Skeleton className="h-20" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-28" />
    </div>
  );
}
