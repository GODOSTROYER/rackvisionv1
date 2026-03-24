import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OperationsMockService, AlertItem } from "@/services/ops/OperationsMockService";

export default function DashboardManagePage() {
  const [searchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const load = useCallback(async () => {
    const entityId = searchParams.get("entityId") ?? undefined;
    const siteId = searchParams.get("siteId") ?? undefined;
    const rackId = searchParams.get("rackId") ?? undefined;
    const deviceId = searchParams.get("deviceId") ?? undefined;
    const payload =
      entityId || siteId || rackId || deviceId
        ? await OperationsMockService.getScopedAlerts({ entityId, siteId, rackId, deviceId }, 25)
        : await OperationsMockService.getAlerts();
    setAlerts(payload);
  }, [searchParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const scopeLabel = useMemo(() => {
    const entityName = searchParams.get("entityName");
    const source = searchParams.get("source");
    if (!entityName && !source) return null;
    return [entityName, source].filter(Boolean).join(" · ");
  }, [searchParams]);

  const runAction = async (alertId: string, action: "ack" | "mute" | "maintenance" | "assign") => {
    await OperationsMockService.updateAlert(alertId, action, "NOC-Shift-B");
    await load();
  };

  const jumpPath = (alert: AlertItem) => {
    if (alert.entityType === "site") return `/dashboard/rackvision/site/${alert.siteId}`;
    if (alert.entityType === "rack") return `/dashboard/rackvision/rack/${alert.entityId}`;
    return `/systems/${alert.entityId}?back=/dashboard/manage`;
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Alert Center"
        subtitle="Incident inbox with lifecycle actions, ownership, and jump-to-entity workflow."
        actions={<Badge variant="outline">{scopeLabel ? "Scoped workflow" : "Live workflow"}</Badge>}
      />

      {scopeLabel ? (
        <div className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Filtering alerts for <span className="font-medium text-foreground">{scopeLabel}</span>.
        </div>
      ) : null}

      <WidgetCard title="Alert Inbox">
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{alert.id} · {alert.title}</p>
                <Badge variant="outline">{alert.severity}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Site: {alert.siteName} · Entity: {alert.entityName} · Status: {alert.status} · Owner: {alert.owner} · Age: {OperationsMockService.formatAlertAge(alert.ageMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">Recommended: {alert.recommendedAction}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => runAction(alert.id, "ack")}>Acknowledge</Button>
                <Button size="sm" variant="outline" onClick={() => runAction(alert.id, "assign")}>Assign</Button>
                <Button size="sm" variant="outline" onClick={() => runAction(alert.id, "mute")}>Mute</Button>
                <Button size="sm" variant="outline" onClick={() => runAction(alert.id, "maintenance")}>Maintenance Mode</Button>
                <Button asChild size="sm"><Link to={jumpPath(alert)}>Jump to Entity</Link></Button>
              </div>
            </div>
          ))}
          {alerts.length === 0 ? <p className="text-sm text-muted-foreground">No alerts match the current scope.</p> : null}
        </div>
      </WidgetCard>
    </section>
  );
}
