import { RackDeviceViewModel } from "@/components/rackvision/types";
import { RackFrame } from "@/components/rackvision/RackFrame";
import { RackUnitLabelColumn } from "@/components/rackvision/RackUnitLabelColumn";

type RackElevationProps = {
  devices: RackDeviceViewModel[];
  emptyUnits: number[];
  showEmptyUnits: boolean;
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onHoverDevice: (deviceId: string | null) => void;
  onOpenSystem: (deviceId: string) => void;
};

export function RackElevation({ devices, emptyUnits, showEmptyUnits, selectedDeviceId, onSelectDevice, onHoverDevice, onOpenSystem }: RackElevationProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[56px_minmax(0,1fr)]">
      <RackUnitLabelColumn />
      <RackFrame
        devices={devices}
        emptyUnits={emptyUnits}
        showEmptyUnits={showEmptyUnits}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={onSelectDevice}
        onHoverDevice={onHoverDevice}
        onOpenSystem={onOpenSystem}
      />
    </div>
  );
}
