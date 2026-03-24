import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { QuickActionButtons } from "@/components/rackvision/QuickActionButtons";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import { Badge } from "@/components/ui/badge";
import {
  OperationsMockService,
  RackOperationalSummary,
  RemoteAction,
} from "@/services/ops/OperationsMockService";

export function RackInspector({ summary }: { summary: InspectorSummary }) {
  const navigate = useNavigate();
  const [opsSummary, setOpsSummary] = useState<RackOperationalSummary | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (summary.entity.kind !== "rack") {
        setOpsSummary(null);
        return;
      }
      const next = await OperationsMockService.getRackOperationalSummary(summary.entity.id);
      if (!cancelled) {
        setOpsSummary(next);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [summary.entity.id, summary.entity.kind]);

  const handleAction = async (action: string) => {
    setActionBusy(action);
    try {
      if (action === "View Alerts") {
        navigate(`/dashboard/manage?rackId=${encodeURIComponent(summary.entity.id)}&entityName=${encodeURIComponent(summary.entity.name)}&source=RackVision`);
        return;
      }

      if (action === "Maintenance Mode") {
        const result = await OperationsMockService.setMaintenance({ entityType: "rack", entityId: summary.entity.id });
        toast({ title: "Rack maintenance", description: result.message });
      } else {
        const targetDeviceId = summary.children.find((child) => child.kind === "device")?.id;
        if (!targetDeviceId) {
          toast({ title: "No device linked", description: "Rack has no device records in mock data." });
          return;
        }
        const remoteAction = action === "Remote Access" ? "Open Remote Session" : (action as RemoteAction);
        await OperationsMockService.runRemoteAction(targetDeviceId, remoteAction);
        toast({ title: `${remoteAction} queued`, description: `${summary.entity.name} device action submitted.` });
      }
      setOpsSummary(await OperationsMockService.getRackOperationalSummary(summary.entity.id));
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{summary.entity.name}</h3>
        <p className="text-xs text-muted-foreground">Rack</p>
        <div className="mt-1"><StatusBadge status={summary.entity.healthStatus} /></div>
      </div>
      <MetricRow label="Occupancy" value={`${summary.entity.kind === "rack" ? summary.entity.occupancyPercent : 0}%`} />
      <MetricRow label="Total Units" value={String(summary.entity.kind === "rack" ? summary.entity.totalUnits : 42)} />
      <MetricRow label="Used Units" value={String(summary.usedUnits ?? 0)} />
      <MetricRow label="Available Units" value={String(summary.availableUnits ?? 0)} />
      <MetricRow label="Devices" value={String(summary.counts.devices)} />
      <MetricRow label="Power Load" value={`${summary.rackMetrics?.powerLoadKw ?? 0} kW`} />
      <MetricRow label="Thermal State" value={summary.rackMetrics?.temperatureState ?? "Stable"} />
      {opsSummary ? (
        <div className="space-y-2 rounded-md border border-border bg-background/70 p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rack Ops</p>
            <Badge variant="outline">{opsSummary.metric.hotspotRisk} hotspot</Badge>
          </div>
          <MetricRow label="Alert Concentration" value={`${opsSummary.metric.alertConcentration}%`} />
          <MetricRow label="Device Density" value={`${opsSummary.metric.deviceDensity}%`} />
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Top Recommendations</p>
            <div className="flex flex-wrap gap-2">
              {opsSummary.recommendations.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <QuickActionButtons
        onOpenSystem={() => {
          const firstDevice = summary.children.find((child) => child.kind === "device");
          if (firstDevice && summary.entity.kind === "rack") {
            navigate(`/systems/${firstDevice.id}?back=${encodeURIComponent(`/dashboard/rackvision/rack/${summary.entity.id}`)}`);
          }
          else toast({ title: "No device linked", description: "Rack has no device records in mock data." });
        }}
        onAction={handleAction}
      />
      {actionBusy ? <p className="text-xs text-muted-foreground">Running {actionBusy}...</p> : null}
    </div>
  );
}
