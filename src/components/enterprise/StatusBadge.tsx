import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  healthy: "bg-[hsl(var(--healthy)/0.12)] text-[hsl(var(--healthy))] border-[hsl(var(--healthy)/0.3)]",
  warning: "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.35)]",
  critical: "bg-[hsl(var(--critical)/0.12)] text-[hsl(var(--critical))] border-[hsl(var(--critical)/0.35)]",
  offline: "bg-[hsl(var(--offline)/0.12)] text-[hsl(var(--offline))] border-[hsl(var(--offline)/0.3)]",
  maintenance: "bg-muted text-muted-foreground border-border",
  info: "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)]",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    normalized.includes("critical") || normalized.includes("failed")
      ? "critical"
      : normalized.includes("warning") || normalized.includes("pending") || normalized.includes("progress")
        ? "warning"
        : normalized.includes("offline")
          ? "offline"
          : normalized.includes("maintenance")
            ? "maintenance"
          : normalized.includes("healthy") || normalized.includes("installed") || normalized.includes("online")
            ? "healthy"
            : normalized.includes("info")
              ? "info"
              : "default";

  return <Badge className={cn("border font-medium", toneClasses[tone])}>{status}</Badge>;
}
