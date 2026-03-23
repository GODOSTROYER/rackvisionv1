import { Skeleton } from "@/components/ui/skeleton";

export function GlobalViewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  );
}
