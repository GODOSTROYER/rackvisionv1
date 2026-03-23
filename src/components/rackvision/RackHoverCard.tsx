import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Device } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type RackHoverCardProps = {
  device: Device;
  onOpenDetails: () => void;
};

export function RackHoverCard({ device, onOpenDetails }: RackHoverCardProps) {
  return (
    <div className="w-64 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">{device.name}</p>
        <StatusBadge status={device.healthStatus} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
        <p>Type: <span className="text-foreground">{device.deviceType}</span></p>
        <p>IP: <span className="text-foreground">{device.ipAddress}</span></p>
        <p>CPU: <span className="text-foreground">{device.cpuUsage}%</span></p>
        <p>Memory: <span className="text-foreground">{device.memoryUsage}%</span></p>
        <p>Temp: <span className="text-foreground">{device.temperature}°C</span></p>
        <p>Net I/O: <span className="text-foreground">{device.networkIo}</span></p>
        <p>Rack Unit: <span className="text-foreground">U{device.rackUnitStart}-{device.rackUnitStart + device.rackUnitSize - 1}</span></p>
        <p>Uptime: <span className="text-foreground">{device.uptime}</span></p>
      </div>
      <Button size="sm" className="w-full" onClick={onOpenDetails}>Open Details</Button>
    </div>
  );
}
