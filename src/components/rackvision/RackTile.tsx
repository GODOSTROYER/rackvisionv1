import { LayoutOverlayMode, LayoutRackTileModel } from "@/components/rackvision/types";
import { StatusDot } from "@/components/rackvision/StatusDot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RackTileProps = {
  rack: LayoutRackTileModel;
  selected: boolean;
  overlayMode?: LayoutOverlayMode;
  onSelect: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

function getOverlayLabel(rack: LayoutRackTileModel, overlayMode: LayoutOverlayMode) {
  if (overlayMode === "occupancy") return `${rack.occupancyPercent}% occ`;
  if (overlayMode === "thermal") return `${rack.avgTemperature}°C`;
  if (overlayMode === "power") return `${rack.powerDrawKw}kW`;
  return `${rack.alertCount} alerts`;
}

export function RackTile({ rack, selected, overlayMode = "alerts", onSelect, onOpenRack }: RackTileProps) {
  const overlayLabel = getOverlayLabel(rack, overlayMode);
  const tone =
    overlayMode === "thermal"
      ? rack.hotspotRisk === "High"
        ? "border-destructive/60 bg-destructive/10"
        : rack.hotspotRisk === "Medium"
          ? "border-amber-500/50 bg-amber-500/10"
          : "border-border"
      : overlayMode === "power"
        ? rack.powerDrawKw > 8
          ? "border-destructive/60 bg-destructive/10"
          : "border-border"
        : overlayMode === "occupancy"
          ? rack.occupancyPercent > 80
            ? "border-amber-500/60 bg-amber-500/10"
            : "border-border"
          : rack.alertCount > 0
            ? "border-destructive/40 bg-destructive/10"
            : "border-border";

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-2 transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        selected ? "border-primary ring-1 ring-primary" : tone,
        selected && "shadow-sm",
      )}
      onClick={() => onSelect(rack.rackId)}
      onDoubleClick={() => onOpenRack(rack.rackId)}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          onSelect(rack.rackId);
        }

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          onOpenRack(rack.rackId);
        }

        if (event.key === "Enter" && selected) {
          event.preventDefault();
          onOpenRack(rack.rackId);
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{rack.rackName}</p>
        <StatusDot status={rack.healthStatus} className="h-2.5 w-2.5" />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", tone)}>{overlayLabel}</span>
        <span>{rack.deviceCount} devices</span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
        <p>Occ: <span className="text-foreground">{rack.occupancyPercent}%</span></p>
        <p>Alerts: <span className="text-foreground">{rack.alertCount}</span></p>
        <p>Devices: <span className="text-foreground">{rack.deviceCount}</span></p>
        <p>Hotspot: <span className="text-foreground">{rack.hotspotRisk}</span></p>
      </div>
      <Button size="sm" variant="ghost" className="mt-1 h-6 w-full text-[10px]" onClick={(event) => { event.stopPropagation(); onOpenRack(rack.rackId); }}>
        Open Rack View
      </Button>
    </article>
  );
}
