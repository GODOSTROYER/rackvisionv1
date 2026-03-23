import { Activity, Info, ShieldCheck } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";

export function InspectorPlaceholder() {
  const { state } = useRackVision();

  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Inspector</h2>
        <span className="text-xs text-muted-foreground">Read-only shell</span>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Selection Snapshot</p>
        <p>Entity ID: {state.selectedEntityId ?? "None selected"}</p>
        <p>Entity Kind: {state.selectedEntityKind ?? "N/A"}</p>
        <p>Inspector Target: {state.inspectorEntityId ?? "Closed"}</p>
      </div>

      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
          <Info className="h-3.5 w-3.5" /> Step 2 will render entity metrics, quick actions, and health rollups.
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
          <Activity className="h-3.5 w-3.5" /> Future: mini trend charts and event timeline.
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> UI scaffold only; no backend telemetry in Step 1.
        </div>
      </div>
    </aside>
  );
}
