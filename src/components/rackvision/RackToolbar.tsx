import { RackDeviceSearch } from "@/components/rackvision/RackDeviceSearch";
import { RackSummary } from "@/components/rackvision/types";
import { RackSwitcher } from "@/components/rackvision/RackSwitcher";
import { RackViewToggleGroup } from "@/components/rackvision/RackViewToggleGroup";
import { RackVisionState } from "@/components/rackvision/types";

type RackToolbarProps = {
  state: RackVisionState;
  rackOptions: RackSummary[];
  activeRackId: string;
  onSwitchRack: (rackId: string) => void;
  onDeviceSearchChange: (value: string) => void;
  onShowEmptyUnitsChange: (value: boolean) => void;
  onHighlightCriticalChange: (value: boolean) => void;
  onDeviceFilterChange: (filter: RackVisionState["rackDeviceFilter"]) => void;
};

export function RackToolbar({
  state,
  rackOptions,
  activeRackId,
  onSwitchRack,
  onDeviceSearchChange,
  onShowEmptyUnitsChange,
  onHighlightCriticalChange,
  onDeviceFilterChange,
}: RackToolbarProps) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <RackDeviceSearch value={state.rackDeviceSearchQuery} onChange={onDeviceSearchChange} />
        <RackSwitcher racks={rackOptions} activeRackId={activeRackId} onSwitch={onSwitchRack} />
      </div>
      <RackViewToggleGroup
        showEmptyUnits={state.showEmptyUnits}
        highlightCriticalOnly={state.highlightCriticalOnly}
        deviceFilter={state.rackDeviceFilter}
        onShowEmptyUnitsChange={onShowEmptyUnitsChange}
        onHighlightCriticalChange={onHighlightCriticalChange}
        onDeviceFilterChange={onDeviceFilterChange}
      />
    </div>
  );
}
