import { Compass, Server } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";

const copyByKind: Record<string, { title: string; body: string }> = {
  none: {
    title: "Welcome to RackVision",
    body: "Select a region, site, rack, or device from the hierarchy to load contextual infrastructure previews.",
  },
  region: {
    title: "Region Overview Placeholder",
    body: "Global View and region-level health canvases will render here in the next step.",
  },
  site: {
    title: "Site Overview Placeholder",
    body: "Data center/site floor summaries and layout visuals are reserved for upcoming implementation.",
  },
  room: {
    title: "Room Context Placeholder",
    body: "Room/row topology previews will be added in later steps.",
  },
  row: {
    title: "Row Context Placeholder",
    body: "Row-level rack distribution and drill-ins will render here soon.",
  },
  rack: {
    title: "Rack View Coming Next",
    body: "Strict 42U CSS Grid rack elevation rendering is intentionally deferred to the next step.",
  },
  device: {
    title: "System Preview Placeholder",
    body: "Device-level quick preview cards and deep telemetry surfaces will appear here in the next phase.",
  },
};

export function SelectionContextPlaceholder() {
  const { state } = useRackVision();
  const key = state.selectedEntityKind ?? "none";
  const content = copyByKind[key] ?? copyByKind.none;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Center Canvas</h2>
        <span className="text-xs text-muted-foreground">Context-aware placeholder</span>
      </div>
      <div className="grid min-h-[520px] place-items-center rounded-lg border border-dashed border-border bg-muted/20">
        <div className="space-y-2 px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            {state.selectedEntityKind === "rack" || state.selectedEntityKind === "device" ? (
              <Server className="h-7 w-7 text-muted-foreground" />
            ) : (
              <Compass className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">{content.title}</p>
          <p className="mx-auto max-w-lg text-xs text-muted-foreground">{content.body}</p>
        </div>
      </div>
    </section>
  );
}
