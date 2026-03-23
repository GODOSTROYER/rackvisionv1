import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RoomSummary } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type RoomCardProps = {
  room: RoomSummary;
  selected: boolean;
  onSelect: (roomId: string) => void;
};

export function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(room.roomId)}
      className={cn(
        "w-full rounded-lg border bg-card p-3 text-left shadow-sm transition hover:border-primary/50",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{room.name}</p>
        <StatusBadge status={room.healthStatus} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
        <p>Rows: <span className="text-foreground">{room.rowCount}</span></p>
        <p>Racks: <span className="text-foreground">{room.rackCount}</span></p>
        <p>Devices: <span className="text-foreground">{room.deviceCount}</span></p>
        <p>Alerts: <span className="text-foreground">{room.alertCount}</span></p>
      </div>
    </button>
  );
}
