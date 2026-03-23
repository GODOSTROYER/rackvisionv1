import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RackSummary } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RackCardProps = {
  rack: RackSummary;
  selected: boolean;
  onSelect: (rackId: string) => void;
  onOpen: (rackId: string) => void;
};

export function RackCard({ rack, selected, onSelect, onOpen }: RackCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm transition hover:border-primary/50",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
      onClick={() => onSelect(rack.rackId)}
      onDoubleClick={() => onOpen(rack.rackId)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(rack.rackId);
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{rack.name}</p>
        <StatusBadge status={rack.healthStatus} />
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">{rack.roomName} • {rack.rowName}</p>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
        <p>Occupancy: <span className="text-foreground">{rack.occupancyPercent}%</span></p>
        <p>Devices: <span className="text-foreground">{rack.deviceCount}</span></p>
        <p>Used/Free U: <span className="text-foreground">{rack.usedUnits}/{rack.availableUnits}</span></p>
        <p>Alerts: <span className="text-foreground">{rack.alertCount}</span></p>
        <p>Power: <span className="text-foreground">{rack.powerLoadKw}kW</span></p>
        <p>Temp: <span className="text-foreground">{rack.avgTemperature}°C</span></p>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onOpen(rack.rackId); }}>
          Open Rack
        </Button>
      </div>
    </article>
  );
}
