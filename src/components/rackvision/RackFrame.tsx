import { RackDeviceViewModel } from "@/components/rackvision/types";
import { RackDeviceBlock } from "@/components/rackvision/RackDeviceBlock";
import { RackEmptyUnit } from "@/components/rackvision/RackEmptyUnit";

type RackFrameProps = {
  devices: RackDeviceViewModel[];
  emptyUnits: number[];
  showEmptyUnits: boolean;
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onHoverDevice: (deviceId: string | null) => void;
  onOpenSystem: (deviceId: string) => void;
};

export function RackFrame({
  devices,
  emptyUnits,
  showEmptyUnits,
  selectedDeviceId,
  onSelectDevice,
  onHoverDevice,
  onOpenSystem,
}: RackFrameProps) {
  return (
    <div className="rounded-md border border-border bg-background p-1 shadow-inner">
      <div
        className="grid rounded border border-border bg-muted/20"
        style={{
          gridTemplateRows: "repeat(42, minmax(var(--rack-unit-height, 24px), var(--rack-unit-height, 24px)))",
        }}
      >
        {emptyUnits.map((unit) => (
          <RackEmptyUnit key={unit} unit={unit} visible={showEmptyUnits} />
        ))}
        {devices.map((item) => (
          <RackDeviceBlock
            key={item.device.id}
            item={item}
            selected={selectedDeviceId === item.device.id}
            onSelect={onSelectDevice}
            onHover={onHoverDevice}
            onOpenSystem={onOpenSystem}
          />
        ))}
      </div>
    </div>
  );
}
