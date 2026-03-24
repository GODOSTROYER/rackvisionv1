import { Bell, FileDown, RefreshCw, ShieldAlert, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { OperationalTrendBars } from "@/components/rackvision/OperationalTrendBars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DeviceOperationalSummary,
  RackOperationalSummary,
  RemoteAction,
} from "@/services/ops/OperationsMockService";

type RackOperationsPanelProps = {
  summary: RackOperationalSummary | null;
  deviceSummary: DeviceOperationalSummary | null;
  selectedDeviceId: string | null;
  onViewAlerts: () => void;
  onRunChecks: () => void;
  onMaintenance: () => void;
  onExport: () => void;
  onRunRemoteAction: (action: RemoteAction, deviceId?: string) => void;
};

export function RackOperationsPanel({
  summary,
  deviceSummary,
  selectedDeviceId,
  onViewAlerts,
  onRunChecks,
  onMaintenance,
  onExport,
  onRunRemoteAction,
}: RackOperationsPanelProps) {
  if (!summary) {
    return null;
  }

  const impacted = summary.impactedDevices.slice(0, 4);

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Rack Operations</p>
          <p className="text-xs text-muted-foreground">{summary.metric.rackName}</p>
        </div>
        <Badge variant="outline">{summary.metric.hotspotRisk} hotspot</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <MetricTile label="Used U" value={`${summary.metric.usedU}`} />
        <MetricTile label="Free U" value={`${summary.metric.freeU}`} />
        <MetricTile label="Power" value={`${summary.metric.powerDrawKw} kW`} />
        <MetricTile label="Temp" value={`${summary.metric.temperatureC} C`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <OperationalTrendBars title="Temperature Trend" valueLabel={`${summary.metric.temperatureC} C now`} points={summary.trends.temperature} tone="warning" />
        <OperationalTrendBars title="Power Draw Trend" valueLabel={`${summary.metric.powerDrawKw} kW now`} points={summary.trends.powerDraw} tone="default" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <FeedPanel title="Scoped Alerts" emptyText="No alerts in scope." items={summary.alerts.slice(0, 3).map((alert) => ({
          id: alert.id,
          title: alert.title,
          meta: `${alert.entityName} • ${alert.owner}`,
          value: `${alert.severity} • ${alert.status}`,
        }))} />
        <FeedPanel title="Activity" emptyText="No recent activity." items={summary.activity.slice(0, 3).map((event) => ({
          id: event.id,
          title: event.action,
          meta: `${event.actor} • ${event.target}`,
          value: event.impact,
        }))} />
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background/70 p-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recommended Actions</p>
        <div className="flex flex-wrap gap-2">
          {summary.recommendations.slice(0, 3).map((recommendation) => (
            <div key={recommendation} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground">
              {recommendation}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background/70 p-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Impacted Devices</p>
          <Badge variant="outline">{summary.impactedDevices.length} tracked</Badge>
        </div>
        <div className="space-y-1.5">
          {impacted.length ? impacted.map((device) => (
            <button
              key={device.id}
              type="button"
              className="flex w-full items-center justify-between rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onRunRemoteAction("Open Remote Session", device.id)}
            >
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{device.name}</span>
                <span className="block text-[11px] text-muted-foreground">{device.status} • CPU {device.cpu}% • Mem {device.memory}%</span>
              </span>
              <StatusBadge status={device.status === "Offline" ? "Offline" : device.status === "Critical" ? "Critical" : device.status === "Warning" ? "Warning" : "Healthy"} />
            </button>
          )) : <p className="text-xs text-muted-foreground">No impacted devices tracked.</p>}
        </div>
      </div>

      {deviceSummary?.device && selectedDeviceId ? (
        <div className="space-y-2 rounded-lg border border-border bg-background/70 p-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Selected Device</p>
              <p className="text-sm font-semibold text-foreground">{deviceSummary.device.name}</p>
            </div>
            <StatusBadge status={deviceSummary.device.status === "Offline" ? "Offline" : deviceSummary.device.status === "Critical" ? "Critical" : deviceSummary.device.status === "Warning" ? "Warning" : "Healthy"} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetricTile label="CPU" value={`${deviceSummary.device.cpu}%`} />
            <MetricTile label="Memory" value={`${deviceSummary.device.memory}%`} />
            <MetricTile label="Disk" value={`${deviceSummary.device.disk}%`} />
            <MetricTile label="Latency" value={`${deviceSummary.device.latencyMs} ms`} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recommended Actions</p>
            <div className="flex flex-wrap gap-2">
              {deviceSummary.recommendedActions.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onViewAlerts}>
          <Bell className="mr-1 h-4 w-4" /> View Alerts
        </Button>
        <Button size="sm" variant="outline" onClick={onRunChecks}>
          <RefreshCw className="mr-1 h-4 w-4" /> Run Checks
        </Button>
        <Button size="sm" variant="outline" onClick={onMaintenance}>
          <Wrench className="mr-1 h-4 w-4" /> Maintenance
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          <FileDown className="mr-1 h-4 w-4" /> Export
        </Button>
        <Button size="sm" variant="outline" onClick={() => onRunRemoteAction("Reboot", selectedDeviceId ?? impacted[0]?.id)}>
          <ShieldAlert className="mr-1 h-4 w-4" /> Reboot Device
        </Button>
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function FeedPanel({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Array<{ id: string; title: string; meta: string; value: string }>;
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-0.5 text-muted-foreground">{item.meta}</p>
            <p className="mt-0.5 text-muted-foreground">{item.value}</p>
          </div>
        )) : <p className="text-xs text-muted-foreground">{emptyText}</p>}
      </div>
    </div>
  );
}
