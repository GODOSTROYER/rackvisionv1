import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { LayoutRoomPanelModel } from "@/components/rackvision/types";
import { RowLane } from "@/components/rackvision/RowLane";

type RoomLayoutPanelProps = {
  room: LayoutRoomPanelModel;
  selectedRackId: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectRow: (rowId: string) => void;
  onSelectRack: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

export function RoomLayoutPanel({ room, selectedRackId, onSelectRoom, onSelectRow, onSelectRack, onOpenRack }: RoomLayoutPanelProps) {
  return (
    <article className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => onSelectRoom(room.roomId)}>
        <p className="text-sm font-semibold text-foreground">{room.roomName}</p>
        <StatusBadge status={room.healthStatus} />
      </button>
      <div className="space-y-2">
        {room.rows.map((row) => (
          <RowLane
            key={row.rowId}
            row={row}
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
