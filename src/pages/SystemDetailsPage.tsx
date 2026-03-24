import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BackToRackVisionBanner } from "@/components/rackvision/BackToRackVisionBanner";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { OperationsMockService, DeviceOpsDetails, ExecutionTimelineItem, RemoteAction } from "@/services/ops/OperationsMockService";

const actions: RemoteAction[] = ["Reboot", "Restart Service", "Run Script", "Open Remote Session", "Maintenance Mode", "Isolate Host"];

export default function SystemDetailsPage() {
  const { systemId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<DeviceOpsDetails | null>(null);
  const [timeline, setTimeline] = useState<ExecutionTimelineItem[]>([]);
  const [busyAction, setBusyAction] = useState<RemoteAction | null>(null);

  const backPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("back") ?? "/dashboard/rackvision";
  }, [location.search]);

  const load = useCallback(async () => {
    if (!systemId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [deviceDetails, executionTimeline] = await Promise.all([
      OperationsMockService.getDeviceDetails(systemId),
      OperationsMockService.getExecutionTimeline(),
    ]);
    setDetails(deviceDetails);
    setTimeline(executionTimeline);
    setLoading(false);
  }, [systemId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (action: RemoteAction) => {
    if (!details) return;
    setBusyAction(action);
    await OperationsMockService.runRemoteAction(details.id, action);
    await load();
    setBusyAction(null);
  };

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20" />
        <Skeleton className="h-28" />
      </section>
    );
  }

  if (!details) {
    return <RouteFallbackState title="System not found" description="The requested system identifier is missing from mock inventory." />;
  }

  return (
    <section className="space-y-3">
      <BackToRackVisionBanner href={backPath} />
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{details.name}</h2>
            <p className="text-xs text-muted-foreground">{details.siteName} · {details.rackName} · OS: {details.os} · Heartbeat: {details.heartbeatVersion}</p>
          </div>
          <Badge variant="outline">{details.status}</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["CPU", `${details.cpu}%`],
          ["Memory", `${details.memory}%`],
          ["Disk", `${details.disk}%`],
          ["Latency", `${details.latencyMs} ms`],
          ["Packet Loss", `${details.packetLoss}%`],
          ["Network I/O", `${details.networkIn}/${details.networkOut} Mbps`],
          ["Uptime", details.uptime],
          ["Last Check-in", new Date(details.lastCheckIn).toLocaleString()],
        ].map(([label, value]) => (
          <WidgetCard key={label} title={label}><p className="text-sm font-semibold">{value}</p></WidgetCard>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <WidgetCard title="Services / Interfaces / Volumes">
          <div className="space-y-2 text-xs">
            <p className="font-semibold">Services</p>
            {details.services.map((service) => <p key={service.name}>{service.name}: <span className="font-medium">{service.status}</span></p>)}
            <p className="pt-1 font-semibold">Interfaces</p>
            {details.interfaces.map((iface) => <p key={iface.name}>{iface.name} · Rx {iface.rxMbps} / Tx {iface.txMbps} Mbps · Errors {iface.errors}</p>)}
            <p className="pt-1 font-semibold">Volumes</p>
            {details.volumes.map((volume) => <p key={volume.name}>{volume.name} · Usage {volume.usage}% · Free {volume.freeGb} GB</p>)}
          </div>
        </WidgetCard>

        <WidgetCard title="Compliance / Security / Backup">
          <div className="space-y-2 text-xs">
            <p>Patch compliance: <span className="font-medium">{details.compliance.patch}</span></p>
            <p>Unsupported OS: <span className="font-medium">{details.compliance.unsupportedOs ? "Yes" : "No"}</span></p>
            <p>Backup status: <span className="font-medium">{details.compliance.backup}</span></p>
            <p>AV/EDR coverage: <span className="font-medium">{details.compliance.avEdr}</span></p>
            <p>Certificate expiry: <span className="font-medium">{details.compliance.certificateDaysLeft} days</span></p>
            <p>Stale agent: <span className="font-medium">{details.compliance.staleAgent ? "Yes" : "No"}</span></p>
          </div>
        </WidgetCard>
      </div>

      <WidgetCard title="Remote Actions Drawer">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action} size="sm" variant="outline" onClick={() => runAction(action)} disabled={busyAction !== null}>
              {busyAction === action ? "Running..." : action}
            </Button>
          ))}
        </div>
      </WidgetCard>

      <WidgetCard title="Execution Timeline / Recent Events">
        <div className="space-y-2 text-xs">
          {timeline.length === 0 ? <p className="text-muted-foreground">No remote action executed yet.</p> : timeline.map((item) => (
            <div key={item.id} className="rounded border border-border p-2">
              <p className="font-medium">{item.action} · {item.status}</p>
              <p className="text-muted-foreground">{new Date(item.startedAt).toLocaleString()} {item.endedAt ? `→ ${new Date(item.endedAt).toLocaleString()}` : ""}</p>
              <p>{item.result}</p>
            </div>
          ))}
          <Button asChild variant="link" className="h-auto p-0 text-xs"><Link to="/dashboard/manage">Review alert workflow</Link></Button>
        </div>
      </WidgetCard>
    </section>
  );
}
