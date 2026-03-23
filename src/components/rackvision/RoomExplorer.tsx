import { RoomCard } from "@/components/rackvision/RoomCard";
import { RoomSummary } from "@/components/rackvision/types";

type RoomExplorerProps = {
  rooms: RoomSummary[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
};

export function RoomExplorer({ rooms, selectedRoomId, onSelectRoom }: RoomExplorerProps) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room Explorer</p>
      <div className="grid gap-2 md:grid-cols-2">
        {rooms.map((room) => (
          <RoomCard key={room.roomId} room={room} selected={selectedRoomId === room.roomId} onSelect={onSelectRoom} />
        ))}
      </div>
    </section>
  );
}
