import { LayoutRowLaneModel } from "@/components/rackvision/types";
import { RackTile } from "@/components/rackvision/RackTile";
import { StatusBadge } from "@/components/enterprise/StatusBadge";

type RowLaneProps = {
  row: LayoutRowLaneModel;
  selectedRackId: string | null;
  onSelectRow: (rowId: string) => void;
  onSelectRack: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

export function RowLane({ row, selectedRackId, onSelectRow, onSelectRack, onOpenRack }: RowLaneProps) {
  return (
    <section className="space-y-2 rounded-lg border border-border bg-muted/20 p-2">
      <button
        type="button"
        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-transparent px-1 py-0.5 text-left hover:border-border"
        onClick={() => onSelectRow(row.rowId)}
      >
        <span className="text-xs font-semibold text-foreground">{row.rowName}</span>
        <div className="flex flex-wrap items-center gap-2">
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
            onSelect={onSelectRack}
            onOpenRack={onOpenRack}
          />
        ))}
      </div>
    </section>
  );
}
