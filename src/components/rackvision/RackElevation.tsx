import { InfraDevice, InfraRack } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DeviceHoverCard } from "@/components/rackvision/DeviceHoverCard";

type RackElevationProps = {
  rack: InfraRack;
  devices: InfraDevice[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onOpenSystem: (deviceId: string) => void;
  showEmptySlots: boolean;
};

export function RackElevation({ rack, devices, selectedDeviceId, onSelectDevice, onOpenSystem, showEmptySlots }: RackElevationProps) {
  const units = Array.from({ length: 42 }, (_, i) => 42 - i);

  const getDeviceForUnit = (unit: number) =>
    devices.find((device) => unit >= device.rackUnitStart && unit < device.rackUnitStart + device.rackUnitSize);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{rack.name} Elevation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid max-h-[720px] grid-cols-[40px_1fr] gap-2 overflow-auto rounded-md border border-border p-2">
          <div className="space-y-1 text-right text-[10px] text-muted-foreground">
            {units.map((unit) => (
              <div key={unit} className="h-6 leading-6">
                U{unit}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {units.map((unit) => {
              const device = getDeviceForUnit(unit);

              if (!device && !showEmptySlots) return null;

              if (!device) {
                return <div key={unit} className="h-6 rounded-sm border border-dashed border-border bg-muted/40" />;
              }

              const isStart = device.rackUnitStart === unit;
              if (!isStart) return null;

              return (
                <HoverCard key={device.id} openDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onSelectDevice(device.id)}
                      onDoubleClick={() => onOpenSystem(device.id)}
                      className={`w-full rounded-sm border px-2 text-left text-xs transition hover:border-primary ${
                        selectedDeviceId === device.id ? "border-primary bg-primary/10" : "border-border bg-card"
                      }`}
                      style={{ height: `${device.rackUnitSize * 24 + (device.rackUnitSize - 1) * 4}px` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{device.hostname}</span>
                        <span className="text-muted-foreground">{device.deviceType}</span>
                      </div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="border-border bg-card">
                    <DeviceHoverCard device={device} onOpenDetails={() => onOpenSystem(device.id)} />
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
