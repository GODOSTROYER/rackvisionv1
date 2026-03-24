import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { KPIStatCard } from "@/components/enterprise/KPIStatCard";
import { LoadingCard } from "@/components/enterprise/LoadingCard";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OperationsMockService, OpsFilters, TimeFilter, UserRolePreset } from "@/services/ops/OperationsMockService";

const defaultFilters: OpsFilters = {
  severity: "all",
  region: "all",
  siteType: "all",
  deviceType: "all",
  compliance: "all",
};

const savedViews = ["All", "Critical Sites", "High Temp Racks", "Offline Devices"] as const;
const timeFilters: { label: string; value: TimeFilter }[] = [
  { label: "Now", value: "now" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
];

export default function DashboardViewPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof OperationsMockService.getCommandCenter>> | null>(null);
  const [filters, setFilters] = useState<OpsFilters>(defaultFilters);
  const [savedView, setSavedView] = useState<(typeof savedViews)[number]>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("now");
  const [rolePreset, setRolePreset] = useState<UserRolePreset>("NOC");
  const [livePulse, setLivePulse] = useState<{ activeCritical: number; openAlerts: number; activityCount: number } | null>(null);

  const load = useCallback(async () => {
    const snapshot = await OperationsMockService.getCommandCenter(filters, timeFilter, savedView);
    setData(snapshot);
  }, [filters, savedView, timeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void (async () => {
        const tick = await OperationsMockService.simulateLiveTick();
        setLivePulse(tick);
        await load();
      })();
    }, 7000);
    return () => window.clearInterval(timer);
  }, [load]);

  const applyRolePreset = (role: UserRolePreset) => {
    setRolePreset(role);
    setFilters((prev) => ({ ...prev, ...OperationsMockService.getRolePreset(role) }));
  };

  const complianceSummary = useMemo(() => {
    if (!data) return "-";
    const avg = Math.round(data.sites.reduce((acc, site) => acc + site.patchCompliance, 0) / data.sites.length);
    return `${avg}% compliant`;
  }, [data]);

  return (
    <section className="space-y-4">
      <PageHeader
        title="RackVision Command Center"
        subtitle="Detect issue → isolate blast radius → inspect device → take action → verify recovery."
        actions={<Badge variant="outline">Live Ops Demo</Badge>}
      />

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Role View:</span>
          {(["NOC", "Infra Admin", "Ops Manager"] as const).map((role) => (
            <Button key={role} size="sm" variant={rolePreset === role ? "default" : "outline"} onClick={() => applyRolePreset(role)}>
              {role}
            </Button>
          ))}
          <span className="ml-3 text-xs font-medium text-muted-foreground">Time:</span>
          {timeFilters.map((item) => (
            <Button key={item.value} size="sm" variant={timeFilter === item.value ? "default" : "outline"} onClick={() => setTimeFilter(item.value)}>
              {item.label}
            </Button>
          ))}
          <span className="ml-3 text-xs font-medium text-muted-foreground">Saved View:</span>
          {savedViews.map((view) => (
            <Button key={view} size="sm" variant={savedView === view ? "default" : "outline"} onClick={() => setSavedView(view)}>
              {view}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filters.severity === "Critical" ? "default" : "outline"} onClick={() => setFilters((prev) => ({ ...prev, severity: prev.severity === "Critical" ? "all" : "Critical" }))}>
            Severity: Critical
          </Button>
          <Button size="sm" variant={filters.region === "US-East" ? "default" : "outline"} onClick={() => setFilters((prev) => ({ ...prev, region: prev.region === "US-East" ? "all" : "US-East" }))}>
            Region: US-East
          </Button>
          <Button size="sm" variant={filters.deviceType === "Firewall" ? "default" : "outline"} onClick={() => setFilters((prev) => ({ ...prev, deviceType: prev.deviceType === "Firewall" ? "all" : "Firewall" }))}>
            Device: Firewall
          </Button>
          <Button size="sm" variant={filters.compliance === "At Risk" ? "default" : "outline"} onClick={() => setFilters((prev) => ({ ...prev, compliance: prev.compliance === "At Risk" ? "all" : "At Risk" }))}>
            Compliance: At Risk
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setFilters(defaultFilters)}>Clear Filters</Button>
        </div>
      </div>

      {data?.incidentSpotlight && (
        <div className="rounded-lg border border-red-400/60 bg-red-500/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300">Incident Spotlight</p>
          <p className="text-sm font-semibold">{data.incidentSpotlight.title}</p>
          <p className="text-xs text-muted-foreground">{data.incidentSpotlight.siteName} · Owner: {data.incidentSpotlight.owner} · Action: {data.incidentSpotlight.recommendedAction}</p>
          <Button asChild className="mt-2" size="sm"><Link to="/dashboard/manage">Open Alert Inbox</Link></Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data ? data.kpis.map((kpi) => <KPIStatCard key={kpi.label} label={kpi.label} value={kpi.value} delta={kpi.tone === "critical" ? "Attention" : "Stable"} tone={kpi.tone} />) : Array.from({ length: 9 }).map((_, i) => <LoadingCard key={i} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WidgetCard title="Top Issues">
          <div className="space-y-2 text-sm">
            {data?.topIssues.map((issue) => (
              <div key={issue.id} className="rounded-md border border-border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{issue.title}</span>
                  <Badge variant="outline">{issue.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{issue.siteName} · {OperationsMockService.formatAlertAge(issue.ageMinutes)} · {issue.status}</p>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Recently Changed / Activity">
          <div className="space-y-2 text-sm">
            {data?.activity.map((event) => (
              <div key={event.id} className="rounded-md border border-border p-2">
                <p className="font-medium">{event.action}</p>
                <p className="text-xs text-muted-foreground">{event.at} · {event.actor} · {event.target} · {event.impact}</p>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Compliance / Recovery Snapshot">
          <div className="space-y-2 text-sm">
            <p>Patch posture: <span className="font-semibold">{complianceSummary}</span></p>
            <p>Backup reliability: <span className="font-semibold">{data ? `${100 - data.sites.reduce((acc, site) => acc + site.backupFailures, 0) * 6}%` : "-"}</span></p>
            <p>Open alerts: <span className="font-semibold">{livePulse?.openAlerts ?? data?.alerts.length ?? "-"}</span></p>
            <p>Critical alerts: <span className="font-semibold">{livePulse?.activeCritical ?? data?.alerts.filter((a) => a.severity === "Critical").length ?? "-"}</span></p>
            <Button asChild size="sm" className="mt-2"><Link to="/reporting">Open Reporting</Link></Button>
          </div>
        </WidgetCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <WidgetCard title="Top Risky Sites">
          <div className="space-y-2 text-sm">
            {data?.sites.map((site) => (
              <div key={site.siteId} className="grid grid-cols-2 gap-2 rounded-md border border-border p-2 text-xs">
                <span className="font-medium">{site.siteName}</span>
                <span>Power {site.powerLoadKw}kW / Headroom {site.powerHeadroomKw}kW</span>
                <span>Cooling {site.coolingHealth}% · Network {site.networkHealth}%</span>
                <span>Backup failures {site.backupFailures} · Patch {site.patchCompliance}%</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Most Alerting Racks">
          <div className="space-y-2 text-sm">
            {data?.racks.map((rack) => (
              <div key={rack.rackId} className="grid grid-cols-2 gap-2 rounded-md border border-border p-2 text-xs">
                <span className="font-medium">{rack.rackName}</span>
                <span>Used U {rack.usedU} / Free U {rack.freeU}</span>
                <span>Power {rack.powerDrawKw}kW · Temp {rack.temperatureC}°C</span>
                <span>Hotspot {rack.hotspotRisk} · Alert concentration {rack.alertConcentration}%</span>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </section>
  );
}
