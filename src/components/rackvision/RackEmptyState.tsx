import { ServerOff } from "lucide-react";

export function RackEmptyState() {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
          <ServerOff className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No rack devices in current filter</p>
        <p className="text-xs text-muted-foreground">Try changing the device search, type filter, or status filter.</p>
      </div>
    </div>
  );
}
