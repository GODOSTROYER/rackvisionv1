import { Globe } from "lucide-react";

export function GlobalViewEmptyState() {
  return (
    <div className="grid min-h-[380px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No global marker data</p>
        <p className="max-w-sm text-xs text-muted-foreground">Mock marker data is currently unavailable. Refresh to reload the infrastructure snapshot.</p>
      </div>
    </div>
  );
}
