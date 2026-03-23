import { Orbit, PanelTopOpen } from "lucide-react";

export function CanvasPlaceholder() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Center Canvas</h2>
        <span className="text-xs text-muted-foreground">Globe boundary scaffold</span>
      </div>

      <div className="grid min-h-[460px] place-items-center rounded-lg border border-dashed border-border bg-muted/20">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <Orbit className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Global Canvas Placeholder</p>
          <p className="mx-auto max-w-md text-xs text-muted-foreground">
            Step 1 scaffold: reserved module boundary for a future lightweight 3D globe component and coordinated view rendering.
          </p>
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
            <PanelTopOpen className="h-3.5 w-3.5" /> No map/rack rendering yet
          </div>
        </div>
      </div>
    </section>
  );
}
