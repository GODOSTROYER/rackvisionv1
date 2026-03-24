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
    <div className="overflow-auto rounded-md border border-border bg-background/60 p-1.5 sm:p-2">
      <div className="grid min-w-[640px] gap-2 [grid-template-columns:44px_minmax(0,1fr)] [--rack-unit-height:28px] sm:min-w-[720px] sm:gap-3 sm:[grid-template-columns:56px_minmax(0,1fr)] sm:[--rack-unit-height:24px]">
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
    </div>
  );
}
