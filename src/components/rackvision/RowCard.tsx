import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RowSummary } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type RowCardProps = {
  row: RowSummary;
  selected: boolean;
  onSelect: (rowId: string) => void;
};

export function RowCard({ row, selected, onSelect }: RowCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(row.rowId)}
      className={cn(
        "rounded-md border bg-card px-3 py-2 text-left transition hover:border-primary/40",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{row.name}</p>
        <StatusBadge status={row.healthStatus} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
        <p>Racks: <span className="text-foreground">{row.racks}</span></p>
        <p>Occupancy: <span className="text-foreground">{row.occupancyPercent}%</span></p>
        <p>Alerts: <span className="text-foreground">{row.activeAlerts}</span></p>
        <p>Temp: <span className="text-foreground">{row.avgTemperature}°C</span></p>
      </div>
    </button>
  );
}
