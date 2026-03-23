import { InfraDevice } from "@/data/mockData";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Button } from "@/components/ui/button";

type DeviceHoverCardProps = {
  device: InfraDevice;
  onOpenDetails: () => void;
};

export function DeviceHoverCard({ device, onOpenDetails }: DeviceHoverCardProps) {
  return (
    <div className="w-72 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">{device.hostname}</p>
        <StatusBadge status={device.status} />
      </div>
      <p className="text-muted-foreground">{device.displayName}</p>
      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
        <p>Type: <span className="text-foreground">{device.deviceType}</span></p>
        <p>IP: <span className="text-foreground">{device.ipAddress}</span></p>
        <p>CPU: <span className="text-foreground">{device.cpuUsage}%</span></p>
        <p>Memory: <span className="text-foreground">{device.memoryUsage}%</span></p>
        <p>Storage: <span className="text-foreground">{device.storageUsage}%</span></p>
        <p>Temp: <span className="text-foreground">{device.temperature}°C</span></p>
        <p>Net I/O: <span className="text-foreground">{device.networkInMbps}/{device.networkOutMbps}</span></p>
        <p>Uptime: <span className="text-foreground">{device.uptime}</span></p>
      </div>
      <Button size="sm" className="w-full" onClick={onOpenDetails}>
        Open Details
      </Button>
    </div>
  );
}
