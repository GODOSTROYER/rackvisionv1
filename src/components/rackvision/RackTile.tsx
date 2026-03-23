import { StatusDot } from "@/components/rackvision/StatusDot";
import { LayoutRackTileModel } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RackTileProps = {
  rack: LayoutRackTileModel;
  selected: boolean;
  onSelect: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

export function RackTile({ rack, selected, onSelect, onOpenRack }: RackTileProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-2 transition hover:border-primary/50",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
      onClick={() => onSelect(rack.rackId)}
      onDoubleClick={() => onOpenRack(rack.rackId)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpenRack(rack.rackId);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{rack.rackName}</p>
        <StatusDot status={rack.healthStatus} className="h-2.5 w-2.5" />
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
        <p>Occ: <span className="text-foreground">{rack.occupancyPercent}%</span></p>
        <p>Alerts: <span className="text-foreground">{rack.alertCount}</span></p>
        <p>Devices: <span className="text-foreground">{rack.deviceCount}</span></p>
      </div>
      <Button size="sm" variant="ghost" className="mt-1 h-6 w-full text-[10px]" onClick={(event) => { event.stopPropagation(); onOpenRack(rack.rackId); }}>
        Open Rack View
      </Button>
    </article>
  );
}
