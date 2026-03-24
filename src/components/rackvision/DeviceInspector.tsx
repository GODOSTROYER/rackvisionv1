import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { QuickActionButtons } from "@/components/rackvision/QuickActionButtons";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import { Badge } from "@/components/ui/badge";
import {
  DeviceOperationalSummary,
  OperationsMockService,
  RemoteAction,
} from "@/services/ops/OperationsMockService";

export function DeviceInspector({ summary }: { summary: InspectorSummary }) {
  const navigate = useNavigate();
  const [opsSummary, setOpsSummary] = useState<DeviceOperationalSummary | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (summary.entity.kind !== "device") {
        setOpsSummary(null);
        return;
      }
      const next = await OperationsMockService.getDeviceOperationalSummary(summary.entity.id);
      if (!cancelled) {
        setOpsSummary(next);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [summary.entity.id, summary.entity.kind]);

  if (summary.entity.kind !== "device") return null;

  const device = summary.entity;
  const deviceOps = opsSummary?.device ?? null;
  const effectiveHealthStatus = deviceOps?.status ?? device.healthStatus;

  const handleAction = async (action: string) => {
    setActionBusy(action);
    try {
      if (action === "View Alerts") {
        navigate(`/dashboard/manage?deviceId=${encodeURIComponent(device.id)}&rackId=${encodeURIComponent(device.rackId)}&entityName=${encodeURIComponent(device.name)}&source=RackVision`);
        return;
      }

      if (action === "Maintenance Mode") {
        const result = await OperationsMockService.setMaintenance({ entityType: "device", entityId: device.id });
        toast({ title: "Maintenance mode", description: result.message });
      } else {
        const remoteAction = action === "Remote Access" ? "Open Remote Session" : (action as RemoteAction);
        await OperationsMockService.runRemoteAction(device.id, remoteAction);
        toast({ title: `${remoteAction} queued`, description: `${device.name} updated in the mock ops service.` });
      }
      setOpsSummary(await OperationsMockService.getDeviceOperationalSummary(device.id));
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{device.name}</h3>
        <p className="text-xs text-muted-foreground">{device.deviceType}</p>
        <div className="mt-1"><StatusBadge status={effectiveHealthStatus} /></div>
      </div>
      <MetricRow label="IP Address" value={device.ipAddress} />
      <MetricRow label="OS / Platform" value={device.osPlatform} />
      <MetricRow label="Rack Unit" value={`U${device.rackUnitStart} • ${device.rackUnitSize}U`} />
      <MetricRow label="CPU" value={`${deviceOps?.cpu ?? device.cpuUsage}%`} />
      <MetricRow label="Memory" value={`${deviceOps?.memory ?? device.memoryUsage}%`} />
      <MetricRow label="Disk" value={`${deviceOps?.disk ?? 0}%`} />
      <MetricRow label="Network I/O" value={`${deviceOps?.networkIn ?? 0} / ${deviceOps?.networkOut ?? 0} Mbps`} />
      <MetricRow label="Latency" value={`${deviceOps?.latencyMs ?? 0} ms`} />
      <MetricRow label="Packet Loss" value={`${deviceOps?.packetLoss ?? 0}%`} />
      <MetricRow label="Temperature" value={`${device.temperature}°C`} />
      <MetricRow label="Uptime" value={deviceOps?.uptime ?? device.uptime} />
      <MetricRow label="Last Check-in" value={deviceOps?.lastCheckIn ? new Date(deviceOps.lastCheckIn).toLocaleString() : "Not available"} />
      <MetricRow label="Power State" value={device.powerState} />
      <MetricRow label="Alert Count" value={String(opsSummary?.alerts.length ?? device.alertCount)} />
      {opsSummary ? (
        <div className="space-y-2 rounded-md border border-border bg-background/70 p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Selected Device Ops</p>
            <Badge variant="outline">{opsSummary.device.compliance.patch}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetricRow label="Backup" value={opsSummary.device.compliance.backup} />
            <MetricRow label="AV / EDR" value={opsSummary.device.compliance.avEdr} />
            <MetricRow label="Cert Expires" value={`${opsSummary.device.compliance.certificateDaysLeft} days`} />
            <MetricRow label="Agent" value={opsSummary.device.compliance.staleAgent ? "Stale" : opsSummary.device.heartbeatVersion} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recent Signals</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetricRow label="Last Seen" value={opsSummary.device.lastCheckIn ? new Date(opsSummary.device.lastCheckIn).toLocaleString() : "Not available"} />
              <MetricRow label="Services" value={`${opsSummary.device.services.filter((item) => item.status !== "Running").length} degraded`} />
            </div>
            {opsSummary.alerts.length ? (
              <p className="text-xs text-muted-foreground">{opsSummary.alerts[0].title}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recommended Actions</p>
            <div className="flex flex-wrap gap-2">
              {opsSummary.recommendedActions.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <QuickActionButtons
        onOpenSystem={() => navigate(`/systems/${device.id}?back=${encodeURIComponent(`/dashboard/rackvision/rack/${device.rackId}`)}`)}
        onAction={handleAction}
      />
      {actionBusy ? <p className="text-xs text-muted-foreground">Running {actionBusy}...</p> : null}
    </div>
  );
}
