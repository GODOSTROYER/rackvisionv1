import { LayoutOverlayMode, LayoutRowLaneModel } from "@/components/rackvision/types";
import { RackTile } from "@/components/rackvision/RackTile";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { cn } from "@/lib/utils";

type RowLaneProps = {
  row: LayoutRowLaneModel;
  overlayMode: LayoutOverlayMode;
  selectedRowId: string | null;
  selectedRackId: string | null;
  onSelectRow: (rowId: string) => void;
  onSelectRack: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

function getOverlayLabel(row: LayoutRowLaneModel, overlayMode: LayoutOverlayMode) {
  if (overlayMode === "occupancy") return `${row.occupancyPercent}% occ`;
  if (overlayMode === "thermal") return `${row.avgTemperature}°C`;
  if (overlayMode === "power") return `${row.powerDrawKw}kW`;
  return `${row.activeAlerts} alerts`;
}

export function RowLane({ row, overlayMode, selectedRowId, selectedRackId, onSelectRow, onSelectRack, onOpenRack }: RowLaneProps) {
  const isSelected = selectedRowId === row.rowId;
  const overlayLabel = getOverlayLabel(row, overlayMode);
  const overlayTone =
    overlayMode === "thermal"
      ? row.hotspotRisk === "High"
        ? "border-destructive/60 bg-destructive/10 text-destructive"
        : row.hotspotRisk === "Medium"
          ? "border-amber-500/60 bg-amber-500/10 text-amber-700"
          : "border-border"
      : overlayMode === "power"
        ? row.powerDrawKw > 10
          ? "border-destructive/60 bg-destructive/10 text-destructive"
          : "border-border"
        : overlayMode === "occupancy"
          ? row.occupancyPercent > 80
            ? "border-amber-500/60 bg-amber-500/10 text-amber-700"
            : "border-border"
          : row.activeAlerts > 0
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-border";

  return (
    <section className={cn("space-y-2 rounded-lg border bg-muted/20 p-2", isSelected ? "border-primary/70 ring-1 ring-primary/30" : "border-border")}>
      <button
        type="button"
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-transparent px-1 py-0.5 text-left hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelectRow(row.rowId)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            onSelectRow(row.rowId);
          }
        }}
      >
        <span className="text-xs font-semibold text-foreground">{row.rowName}</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", overlayTone)}>{overlayLabel}</span>
          <span className="text-[10px] text-muted-foreground">{row.occupancyPercent}% occ • {row.activeAlerts} alerts</span>
          <StatusBadge status={row.healthStatus} />
        </div>
      </button>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {row.racks.map((rack) => (
          <RackTile
            key={rack.rackId}
            rack={rack}
            selected={selectedRackId === rack.rackId}
            overlayMode={overlayMode}
            onSelect={onSelectRack}
            onOpenRack={onOpenRack}
          />
        ))}
      </div>
    </section>
  );
}
