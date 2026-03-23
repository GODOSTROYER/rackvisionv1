import { RackFilters, RowSummary, RoomSummary } from "@/components/rackvision/types";

type RackFilterToolbarProps = {
  filters: RackFilters;
  rooms: RoomSummary[];
  rows: RowSummary[];
  onChange: (filters: RackFilters) => void;
};

export function RackFilterToolbar({ filters, rooms, rows, onChange }: RackFilterToolbarProps) {
  const update = <K extends keyof RackFilters>(key: K, value: RackFilters[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-card p-2 sm:grid-cols-2 xl:grid-cols-5">
      <select value={filters.status} onChange={(event) => update("status", event.target.value as RackFilters["status"])} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground">
        <option value="all">All health</option>
        <option value="Healthy">Healthy</option>
        <option value="Warning">Warning</option>
        <option value="Critical">Critical</option>
        <option value="Offline">Offline</option>
      </select>
      <select value={filters.roomId} onChange={(event) => update("roomId", event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground">
        <option value="all">All rooms</option>
        {rooms.map((room) => (
          <option key={room.roomId} value={room.roomId}>{room.name}</option>
        ))}
      </select>
      <select value={filters.rowId} onChange={(event) => update("rowId", event.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground">
        <option value="all">All rows</option>
        {rows.map((row) => (
          <option key={row.rowId} value={row.rowId}>{row.name}</option>
        ))}
      </select>
      <select value={filters.occupancy} onChange={(event) => update("occupancy", event.target.value as RackFilters["occupancy"])} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground">
        <option value="all">Any occupancy</option>
        <option value="low">Low (&lt;50%)</option>
        <option value="medium">Medium (50-79%)</option>
        <option value="high">High (80%+)</option>
      </select>
      <select value={filters.alertLevel} onChange={(event) => update("alertLevel", event.target.value as RackFilters["alertLevel"])} className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground">
        <option value="all">Any alert level</option>
        <option value="warning_critical">Warning / Critical</option>
        <option value="critical_only">Critical only</option>
      </select>
    </div>
  );
}
