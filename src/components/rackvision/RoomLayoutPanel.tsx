import { LayoutOverlayMode, LayoutRoomPanelModel } from "@/components/rackvision/types";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RowLane } from "@/components/rackvision/RowLane";
import { cn } from "@/lib/utils";

type RoomLayoutPanelProps = {
  room: LayoutRoomPanelModel;
  overlayMode: LayoutOverlayMode;
  selectedRowId: string | null;
  selectedRackId: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectRow: (rowId: string) => void;
  onSelectRack: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

export function RoomLayoutPanel({
  room,
  overlayMode,
  selectedRowId,
  selectedRackId,
  onSelectRoom,
  onSelectRow,
  onSelectRack,
  onOpenRack,
}: RoomLayoutPanelProps) {
  const rackCount = room.rows.reduce((total, row) => total + row.racks.length, 0);
  const alertCount = room.rows.reduce((total, row) => total + row.activeAlerts, 0);
  const isSelectedRoom = room.rows.some((row) => row.rowId === selectedRowId);
  const roomMetric =
    overlayMode === "occupancy"
      ? `${Math.round(room.rows.reduce((total, row) => total + row.occupancyPercent, 0) / Math.max(room.rows.length, 1))}% occ`
      : overlayMode === "thermal"
        ? `${Math.round(room.rows.reduce((total, row) => total + row.avgTemperature, 0) / Math.max(room.rows.length, 1))}°C`
        : overlayMode === "power"
          ? `${room.rows.reduce((total, row) => total + row.powerDrawKw, 0).toFixed(1)}kW`
          : `${alertCount} alerts`;

  return (
    <article className={cn("space-y-2 rounded-xl border bg-card p-3 shadow-sm", isSelectedRoom ? "border-primary/70 ring-1 ring-primary/20" : "border-border")}>
      <button
        type="button"
        className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelectRoom(room.roomId)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            onSelectRoom(room.roomId);
          }
        }}
      >
        <p className="text-sm font-semibold text-foreground">{room.roomName}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {room.rows.length} rows • {rackCount} racks
          </span>
          <span className="rounded-full border border-border bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{roomMetric}</span>
          <StatusBadge status={room.healthStatus} />
        </div>
      </button>
      <div className="space-y-2">
        {room.rows.map((row) => (
          <RowLane
            key={row.rowId}
            row={row}
            overlayMode={overlayMode}
            selectedRowId={selectedRowId}
            selectedRackId={selectedRackId}
            onSelectRow={onSelectRow}
            onSelectRack={onSelectRack}
            onOpenRack={onOpenRack}
          />
        ))}
      </div>
    </article>
  );
}
