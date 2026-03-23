import { AlertTriangle } from "lucide-react";
import { InspectorEmptyState } from "@/components/rackvision/InspectorEmptyState";
import { InspectorSkeleton } from "@/components/rackvision/InspectorSkeleton";
import { DeviceInspector } from "@/components/rackvision/DeviceInspector";
import { RackInspector } from "@/components/rackvision/RackInspector";
import { RegionInspector } from "@/components/rackvision/RegionInspector";
import { RoomInspector } from "@/components/rackvision/RoomInspector";
import { RowInspector } from "@/components/rackvision/RowInspector";
import { SiteInspector } from "@/components/rackvision/SiteInspector";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import { ScrollArea } from "@/components/ui/scroll-area";

type InspectorPanelProps = {
  loading: boolean;
  summary: InspectorSummary | null;
};

export function InspectorPanel({ loading, summary }: InspectorPanelProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Inspector</h2>
        <span className="text-xs text-muted-foreground">Entity details</span>
      </div>

      <ScrollArea className="h-[520px] pr-2">
        {loading ? <InspectorSkeleton /> : null}
        {!loading && !summary ? <InspectorEmptyState /> : null}
        {!loading && summary?.entity.kind === "region" ? <RegionInspector summary={summary} /> : null}
        {!loading && summary?.entity.kind === "site" ? <SiteInspector summary={summary} /> : null}
        {!loading && summary?.entity.kind === "room" ? <RoomInspector summary={summary} /> : null}
        {!loading && summary?.entity.kind === "row" ? <RowInspector summary={summary} /> : null}
        {!loading && summary?.entity.kind === "rack" ? <RackInspector summary={summary} /> : null}
        {!loading && summary?.entity.kind === "device" ? <DeviceInspector summary={summary} /> : null}

        {!loading && summary?.issues?.length ? (
          <div className="mt-3 rounded-md border border-border bg-muted/20 p-2">
            <p className="mb-1 text-[11px] text-muted-foreground">Recent issues</p>
            <div className="space-y-1.5">
              {summary.issues.map((issue) => (
                <div key={issue.id} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs">
                  <p className="font-medium text-foreground">{issue.text}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" /> {issue.severity} • {issue.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </ScrollArea>
    </aside>
  );
}
