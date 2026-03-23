import { HealthStatus } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

const statusTone: Record<HealthStatus, string> = {
  Healthy: "bg-[hsl(var(--healthy))]",
  Warning: "bg-[hsl(var(--warning))]",
  Critical: "bg-[hsl(var(--critical))]",
  Offline: "bg-[hsl(var(--offline))]",
  Maintenance: "bg-muted-foreground",
};

export function StatusDot({ status, className }: { status: HealthStatus; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", statusTone[status], className)} aria-hidden />;
}
