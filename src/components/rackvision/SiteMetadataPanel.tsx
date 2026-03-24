import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, FileDown, RefreshCw, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { OperationalTrendBars } from "@/components/rackvision/OperationalTrendBars";
import { SiteOverview } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ActivityEvent,
  AlertItem,
  OperationsMockService,
  SiteOperationalSummary,
} from "@/services/ops/OperationsMockService";

export function SiteMetadataPanel({ overview, refreshKey = 0 }: { overview: SiteOverview; refreshKey?: number }) {
  const navigate = useNavigate();
  const [opsSummary, setOpsSummary] = useState<SiteOperationalSummary | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const summary = await OperationsMockService.getSiteOperationalSummary(overview.site.id);
      if (!cancelled) {
        setOpsSummary(summary);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [overview.site.id, refreshKey]);

  const handleExport = async () => {
    setRunningAction("Export");
    try {
      const payload = await OperationsMockService.exportScopeSnapshot({ siteId: overview.site.id });
      try {
        await navigator.clipboard.writeText(payload);
        toast({ title: "Site snapshot copied", description: `Snapshot for ${overview.site.name} copied to clipboard.` });
      } catch {
        const blob = new Blob([payload], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${overview.site.id}-site-snapshot.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast({ title: "Site snapshot downloaded", description: "A JSON export was generated for this site scope." });
      }
    } catch {
      toast({ title: "Export unavailable", description: "Copy to clipboard or download is blocked in this environment." });
    } finally {
      setRunningAction(null);
    }
  };

  const handleRunChecks = async () => {
    setRunningAction("Run Checks");
    try {
      const result = await OperationsMockService.runHealthCheck({ entityType: "site", entityId: overview.site.id });
      toast({ title: result.title, description: result.findings[0] ?? "Checks completed." });
      setOpsSummary(await OperationsMockService.getSiteOperationalSummary(overview.site.id));
    } finally {
      setRunningAction(null);
    }
  };

  const handleMaintenance = async () => {
    setRunningAction("Maintenance");
    try {
      const result = await OperationsMockService.setMaintenance({ entityType: "site", entityId: overview.site.id });
      toast({ title: "Maintenance mode", description: result.message });
      setOpsSummary(await OperationsMockService.getSiteOperationalSummary(overview.site.id));
    } finally {
      setRunningAction(null);
    }
  };

  const items = [
    ["Site", overview.site.name],
    ["Region", overview.regionName],
    ["City / Country", `${overview.site.city}, ${overview.site.country}`],
    ["Facility Type", overview.metadata.facilityType],
    ["Power Capacity", overview.metadata.powerCapacity],
    ["Cooling Status", overview.metadata.coolingStatus],
    ["Network Status", overview.metadata.networkStatus],
    ["Availability", overview.metadata.availability],
    ["Last Sync", overview.metadata.lastSync],
  ] as const;

  const alertItems = (opsSummary?.alerts ?? []).slice(0, 3);
  const activityItems = (opsSummary?.activity ?? []).slice(0, 3);

  return (
    <aside className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Site Metadata</p>
          <p className="text-xs text-muted-foreground">{overview.site.city}, {overview.site.country}</p>
        </div>
        <StatusBadge status={overview.site.healthStatus} />
      </div>

      <div className="grid gap-1.5 text-xs text-muted-foreground">
        {items.map(([label, value]) => (
          <p key={label} className="flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-foreground">{value}</span>
          </p>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background/70 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Operations</p>
          {opsSummary ? <Badge variant="outline">{opsSummary.metric.siteType}</Badge> : <Badge variant="outline">{loading ? "Loading" : "Ready"}</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border bg-card p-2">
            <p className="text-[11px] text-muted-foreground">Power Load</p>
            <p className="text-sm font-semibold text-foreground">{opsSummary?.metric.powerLoadKw ?? 0} kW</p>
          </div>
          <div className="rounded-md border border-border bg-card p-2">
            <p className="text-[11px] text-muted-foreground">Headroom</p>
            <p className="text-sm font-semibold text-foreground">{opsSummary?.metric.powerHeadroomKw ?? 0} kW</p>
          </div>
          <div className="rounded-md border border-border bg-card p-2">
            <p className="text-[11px] text-muted-foreground">Cooling</p>
            <p className="text-sm font-semibold text-foreground">{opsSummary?.metric.coolingHealth ?? 0}%</p>
          </div>
          <div className="rounded-md border border-border bg-card p-2">
            <p className="text-[11px] text-muted-foreground">Network</p>
            <p className="text-sm font-semibold text-foreground">{opsSummary?.metric.networkHealth ?? 0}%</p>
          </div>
        </div>
      </div>

      {opsSummary ? (
        <div className="space-y-3 rounded-lg border border-border bg-background/70 p-2">
          <OperationalTrendBars title="Power Load Trend" valueLabel={`${opsSummary.metric.powerLoadKw} kW now`} points={opsSummary.trends.powerLoad} tone="default" />
          <OperationalTrendBars title="Cooling Trend" valueLabel={`${opsSummary.metric.coolingHealth}% now`} points={opsSummary.trends.coolingHealth} tone="healthy" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Recent Alerts</p>
              {alertItems.length ? alertItems.map(renderAlert) : <p className="text-xs text-muted-foreground">No scoped alerts.</p>}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Activity</p>
              {activityItems.length ? activityItems.map(renderActivity) : <p className="text-xs text-muted-foreground">No recent activity.</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Top Rack Pressure</p>
            {opsSummary.topRacks.length ? opsSummary.topRacks.map((rack) => (
              <div key={rack.rackId} className="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1.5 text-xs">
                <span className="text-foreground">{rack.rackName}</span>
                <span className="text-muted-foreground">{rack.temperatureC}C • {rack.alertCount} alerts • {rack.hotspotRisk}</span>
              </div>
            )) : <p className="text-xs text-muted-foreground">No rack pressure in scope.</p>}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/manage?siteId=${encodeURIComponent(overview.site.id)}&entityName=${encodeURIComponent(overview.site.name)}&source=RackVision`)}>
          <Bell className="mr-1 h-4 w-4" /> View Alerts
        </Button>
        <Button size="sm" variant="outline" onClick={handleRunChecks} disabled={runningAction !== null}>
          <RefreshCw className="mr-1 h-4 w-4" /> {runningAction === "Run Checks" ? "Running..." : "Run Checks"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleMaintenance} disabled={runningAction !== null}>
          <Wrench className="mr-1 h-4 w-4" /> {runningAction === "Maintenance" ? "Updating..." : "Maintenance"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={runningAction !== null}>
          <FileDown className="mr-1 h-4 w-4" /> {runningAction === "Export" ? "Exporting..." : "Export"}
        </Button>
      </div>
    </aside>
  );
}

function renderAlert(alert: AlertItem) {
  return (
    <div key={alert.id} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">{alert.title}</p>
        <StatusBadge status={alert.status === "Acknowledged" ? "Warning" : alert.severity === "Info" ? "Healthy" : alert.severity} />
      </div>
      <p className="mt-0.5 text-muted-foreground">{alert.entityName} • {alert.owner}</p>
      <p className="mt-0.5 text-muted-foreground">{alert.recommendedAction}</p>
    </div>
  );
}

function renderActivity(activity: ActivityEvent) {
  return (
    <div key={activity.id} className="rounded-md border border-border bg-card px-2 py-1.5 text-xs">
      <p className="font-medium text-foreground">{activity.action}</p>
      <p className="mt-0.5 text-muted-foreground">{activity.actor} • {activity.target}</p>
      <p className="mt-0.5 text-muted-foreground">{activity.impact}</p>
    </div>
  );
}
