import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { QuickActionButtons } from "@/components/rackvision/QuickActionButtons";
import { InspectorSummary } from "@/components/rackvision/inspector-types";

export function DeviceInspector({ summary }: { summary: InspectorSummary }) {
  const navigate = useNavigate();
  if (summary.entity.kind !== "device") return null;

  const device = summary.entity;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{device.name}</h3>
        <p className="text-xs text-muted-foreground">{device.deviceType}</p>
        <div className="mt-1"><StatusBadge status={device.healthStatus} /></div>
      </div>
      <MetricRow label="IP Address" value={device.ipAddress} />
      <MetricRow label="OS / Platform" value={device.osPlatform} />
      <MetricRow label="Rack Unit" value={`U${device.rackUnitStart} • ${device.rackUnitSize}U`} />
      <MetricRow label="CPU" value={`${device.cpuUsage}%`} />
      <MetricRow label="Memory" value={`${device.memoryUsage}%`} />
      <MetricRow label="Network I/O" value={device.networkIo} />
      <MetricRow label="Temperature" value={`${device.temperature}°C`} />
      <MetricRow label="Uptime" value={device.uptime} />
      <MetricRow label="Power State" value={device.powerState} />
      <MetricRow label="Alert Count" value={String(device.alertCount)} />
      <QuickActionButtons
        onOpenSystem={() => navigate(`/systems/${device.id}?back=${encodeURIComponent(`/dashboard/rackvision/rack/${device.rackId}`)}`)}
        onAction={(action) => {
          toast({ title: action, description: "UI-only RackVision device action." });
        }}
      />
    </div>
  );
}
