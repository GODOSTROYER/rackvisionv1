import { Circle } from "lucide-react";

export function GlobeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Legend</span>
      <span className="inline-flex items-center gap-1">
        <Circle className="h-3 w-3 fill-[hsl(var(--healthy))] text-[hsl(var(--healthy))]" /> Healthy
      </span>
      <span className="inline-flex items-center gap-1">
        <Circle className="h-3 w-3 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" /> Warning
      </span>
      <span className="inline-flex items-center gap-1">
        <Circle className="h-3 w-3 fill-[hsl(var(--critical))] text-[hsl(var(--critical))]" /> Critical
      </span>
      <span className="inline-flex items-center gap-1">
        <Circle className="h-3 w-3 fill-[hsl(var(--offline))] text-[hsl(var(--offline))]" /> Offline
      </span>
      <span className="text-[11px]">Country borders are interactive; click a country to inspect in-country data centers.</span>
    </div>
  );
}