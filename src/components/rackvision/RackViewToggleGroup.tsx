import { RackDeviceFilter } from "@/components/rackvision/types";

type RackViewToggleGroupProps = {
  showEmptyUnits: boolean;
  highlightCriticalOnly: boolean;
  deviceFilter: RackDeviceFilter;
  onShowEmptyUnitsChange: (value: boolean) => void;
  onHighlightCriticalChange: (value: boolean) => void;
  onDeviceFilterChange: (filter: RackDeviceFilter) => void;
};

export function RackViewToggleGroup({
  showEmptyUnits,
  highlightCriticalOnly,
  deviceFilter,
  onShowEmptyUnitsChange,
  onHighlightCriticalChange,
  onDeviceFilterChange,
}: RackViewToggleGroupProps) {
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-card p-2 sm:grid-cols-2 xl:grid-cols-4">
      <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground">
        <input type="checkbox" checked={showEmptyUnits} onChange={(event) => onShowEmptyUnitsChange(event.target.checked)} />
        Show empty units
      </label>
      <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground">
        <input type="checkbox" checked={highlightCriticalOnly} onChange={(event) => onHighlightCriticalChange(event.target.checked)} />
        Critical only
      </label>
      <select
        value={deviceFilter.type}
        onChange={(event) => onDeviceFilterChange({ ...deviceFilter, type: event.target.value as RackDeviceFilter["type"] })}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"
      >
        <option value="all">All device types</option>
        <option value="Server-1U">1U Servers</option>
        <option value="Server-2U">2U Servers</option>
        <option value="Appliance-4U">4U Appliances</option>
        <option value="Storage">Storage</option>
        <option value="Switch-ToR">ToR Switches</option>
        <option value="Firewall">Firewalls</option>
        <option value="PDU">PDU</option>
      </select>
      <select
        value={deviceFilter.status}
        onChange={(event) => onDeviceFilterChange({ ...deviceFilter, status: event.target.value as RackDeviceFilter["status"] })}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"
      >
        <option value="all">All statuses</option>
        <option value="Healthy">Healthy</option>
        <option value="Warning">Warning</option>
        <option value="Critical">Critical</option>
        <option value="Offline">Offline</option>
      </select>
    </div>
  );
}
