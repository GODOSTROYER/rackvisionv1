import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Device, RackSummary } from "@/components/rackvision/types";

type RackPreviewPlaceholderProps = {
  rack: RackSummary;
  siteName: string;
  devices: Device[];
};

export function RackPreviewPlaceholder({ rack, siteName, devices }: RackPreviewPlaceholderProps) {
  return (
    <section className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{rack.name} Preview</p>
          <p className="text-xs text-muted-foreground">{siteName} • {rack.roomName} • {rack.rowName}</p>
        </div>
        <StatusBadge status={rack.healthStatus} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <p>Occupancy: <span className="text-foreground">{rack.occupancyPercent}%</span></p>
        <p>Used / Free U: <span className="text-foreground">{rack.usedUnits}/{rack.availableUnits}</span></p>
        <p>Devices: <span className="text-foreground">{rack.deviceCount}</span></p>
        <p>Alerts: <span className="text-foreground">{rack.alertCount}</span></p>
        <p>Power: <span className="text-foreground">{rack.powerLoadKw}kW</span></p>
        <p>Temp: <span className="text-foreground">{rack.avgTemperature}°C</span></p>
      </div>
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        Detailed 42U Rack Elevation will be rendered in the next step.
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Devices in rack</p>
        <div className="space-y-1">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
              <span className="text-foreground">{device.name}</span>
              <span>{device.deviceType} • U{device.rackUnitStart}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
