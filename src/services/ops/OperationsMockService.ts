export type Severity = "Critical" | "Warning" | "Info";
export type AlertStatus = "Open" | "Acknowledged" | "Muted" | "In Maintenance" | "Resolved";
export type TimeFilter = "now" | "24h" | "7d";
export type UserRolePreset = "NOC" | "Infra Admin" | "Ops Manager";
export type HotspotRisk = "Low" | "Medium" | "High";

export type EntityScope = {
  entityId?: string;
  siteId?: string;
  rackId?: string;
  deviceId?: string;
};

export type OpsFilters = {
  severity: "all" | Severity;
  region: "all" | string;
  siteType: "all" | "Enterprise" | "Edge" | "Colo";
  deviceType: "all" | string;
  compliance: "all" | "Compliant" | "At Risk";
};

export type AlertItem = {
  id: string;
  severity: Severity;
  title: string;
  entityType: "site" | "rack" | "device";
  entityId: string;
  entityName: string;
  siteId: string;
  siteName: string;
  region: string;
  deviceType: string;
  status: AlertStatus;
  owner: string;
  ageMinutes: number;
  recommendedAction: string;
};

export type ActivityEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  impact: string;
  targetId?: string;
  siteId?: string;
  rackId?: string;
  deviceId?: string;
};

export type SiteOpsMetric = {
  siteId: string;
  siteName: string;
  siteType: "Enterprise" | "Edge" | "Colo";
  powerLoadKw: number;
  powerHeadroomKw: number;
  coolingHealth: number;
  occupancy: number;
  criticalDevices: number;
  networkHealth: number;
  backupFailures: number;
  patchCompliance: number;
};

export type RackOpsMetric = {
  rackId: string;
  rackName: string;
  usedU: number;
  freeU: number;
  powerDrawKw: number;
  temperatureC: number;
  hotspotRisk: HotspotRisk;
  deviceDensity: number;
  alertConcentration: number;
};

export type DeviceOpsDetails = {
  id: string;
  name: string;
  siteId: string;
  siteName: string;
  rackId: string;
  rackName: string;
  status: "Healthy" | "Warning" | "Critical" | "Offline";
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  latencyMs: number;
  packetLoss: number;
  uptime: string;
  lastCheckIn: string;
  heartbeatVersion: string;
  os: string;
  services: { name: string; status: "Running" | "Stopped" | "Degraded" }[];
  interfaces: { name: string; rxMbps: number; txMbps: number; errors: number }[];
  volumes: { name: string; usage: number; freeGb: number }[];
  compliance: {
    patch: "Compliant" | "At Risk";
    unsupportedOs: boolean;
    backup: "Healthy" | "Failed";
    avEdr: "Covered" | "Missing";
    certificateDaysLeft: number;
    staleAgent: boolean;
  };
};

export type RemoteAction =
  | "Reboot"
  | "Restart Service"
  | "Run Script"
  | "Open Remote Session"
  | "Maintenance Mode"
  | "Isolate Host";

export type ExecutionTimelineItem = {
  id: string;
  action: RemoteAction;
  status: "Queued" | "Running" | "Completed";
  startedAt: string;
  endedAt?: string;
  result: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type SiteOperationalSummary = {
  metric: SiteOpsMetric;
  alerts: AlertItem[];
  activity: ActivityEvent[];
  trends: {
    powerLoad: TrendPoint[];
    coolingHealth: TrendPoint[];
    alerts: TrendPoint[];
    occupancy: TrendPoint[];
  };
  checks: string[];
  topRacks: Array<{
    rackId: string;
    rackName: string;
    hotspotRisk: HotspotRisk;
    alertCount: number;
    temperatureC: number;
  }>;
};

export type RackOperationalSummary = {
  metric: RackOpsMetric;
  alerts: AlertItem[];
  activity: ActivityEvent[];
  trends: {
    temperature: TrendPoint[];
    powerDraw: TrendPoint[];
    alerts: TrendPoint[];
    density: TrendPoint[];
  };
  impactedDevices: Array<{
    id: string;
    name: string;
    status: DeviceOpsDetails["status"];
    alertCount: number;
    cpu: number;
    memory: number;
    temperature: number;
  }>;
  recommendations: string[];
};

export type DeviceOperationalSummary = {
  device: DeviceOpsDetails;
  alerts: AlertItem[];
  activity: ActivityEvent[];
  recommendedActions: string[];
};

export type HealthCheckResult = {
  title: string;
  findings: string[];
  executedAt: string;
};

export type CommandCenterSnapshot = {
  kpis: { label: string; value: string; tone?: "healthy" | "warning" | "critical" | "info" }[];
  incidentSpotlight: AlertItem | null;
  topIssues: AlertItem[];
  activity: ActivityEvent[];
  alerts: AlertItem[];
  sites: SiteOpsMetric[];
  racks: RackOpsMetric[];
};

const wait = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));
const trendLabels = ["-18h", "-12h", "-6h", "Now"];
const series = (...values: number[]): TrendPoint[] =>
  values.map((value, index) => ({ label: trendLabels[index] ?? `T${index + 1}`, value }));

const seededAlerts: AlertItem[] = [
  { id: "AL-2201", severity: "Critical", title: "Rack temperature hotspot in NET-RACK-03", entityType: "rack", entityId: "net-rack-03", entityName: "NET-RACK-03", siteId: "site-virginia-dc3", siteName: "Virginia-DC3", region: "US-East", deviceType: "Switch-ToR", status: "Open", owner: "NOC-Primary", ageMinutes: 6, recommendedAction: "Throttle non-critical workloads and increase cooling airflow." },
  { id: "AL-2202", severity: "Critical", title: "Firewall offline", entityType: "device", entityId: "device-fw-edge-01", entityName: "FW-EDGE-01", siteId: "site-mumbai-dc1", siteName: "Mumbai-DC1", region: "AP-South", deviceType: "Firewall", status: "Open", owner: "Infra Admin", ageMinutes: 14, recommendedAction: "Open remote session, verify links, and restart packet engine service." },
  { id: "AL-2203", severity: "Warning", title: "Backup job failure on NAS-STOR-01", entityType: "device", entityId: "device-nas-stor-01", entityName: "NAS-STOR-01", siteId: "site-frankfurt-dc1", siteName: "Frankfurt-DC1", region: "EU-West", deviceType: "Storage", status: "Acknowledged", owner: "Backup Ops", ageMinutes: 42, recommendedAction: "Re-run incremental backup and verify repository connectivity." },
  { id: "AL-2204", severity: "Warning", title: "Site latency spike beyond SLA", entityType: "site", entityId: "site-virginia-dc3", entityName: "Virginia-DC3", siteId: "site-virginia-dc3", siteName: "Virginia-DC3", region: "US-East", deviceType: "Network", status: "Open", owner: "NetOps", ageMinutes: 21, recommendedAction: "Reroute traffic and inspect top packet-loss interfaces." },
  { id: "AL-2205", severity: "Info", title: "Planned maintenance on Room B", entityType: "site", entityId: "site-virginia-dc3", entityName: "Virginia-DC3", siteId: "site-virginia-dc3", siteName: "Virginia-DC3", region: "US-East", deviceType: "Facility", status: "In Maintenance", owner: "Facility Ops", ageMinutes: 3, recommendedAction: "Monitor rack temperatures during maintenance window." },
];

const seededSiteMetrics: SiteOpsMetric[] = [
  { siteId: "site-virginia-dc3", siteName: "Virginia-DC3", siteType: "Enterprise", powerLoadKw: 188, powerHeadroomKw: 44, coolingHealth: 78, occupancy: 86, criticalDevices: 6, networkHealth: 71, backupFailures: 2, patchCompliance: 91 },
  { siteId: "site-mumbai-dc1", siteName: "Mumbai-DC1", siteType: "Edge", powerLoadKw: 142, powerHeadroomKw: 58, coolingHealth: 83, occupancy: 79, criticalDevices: 3, networkHealth: 88, backupFailures: 1, patchCompliance: 94 },
  { siteId: "site-frankfurt-dc1", siteName: "Frankfurt-DC1", siteType: "Colo", powerLoadKw: 126, powerHeadroomKw: 64, coolingHealth: 92, occupancy: 68, criticalDevices: 1, networkHealth: 93, backupFailures: 1, patchCompliance: 97 },
];

const seededRackMetrics: RackOpsMetric[] = [
  { rackId: "net-rack-03", rackName: "NET-RACK-03", usedU: 37, freeU: 5, powerDrawKw: 9.6, temperatureC: 41, hotspotRisk: "High", deviceDensity: 88, alertConcentration: 74 },
  { rackId: "rack-a-01", rackName: "RACK-A-01", usedU: 33, freeU: 9, powerDrawKw: 7.4, temperatureC: 34, hotspotRisk: "Medium", deviceDensity: 73, alertConcentration: 38 },
  { rackId: "rack-b-07", rackName: "RACK-B-07", usedU: 28, freeU: 14, powerDrawKw: 6.1, temperatureC: 31, hotspotRisk: "Low", deviceDensity: 61, alertConcentration: 22 },
];

const seededDevices: DeviceOpsDetails[] = [
  { id: "device-sw-tor-02", name: "SW-TOR-02", siteId: "site-virginia-dc3", siteName: "Virginia-DC3", rackId: "net-rack-03", rackName: "NET-RACK-03", status: "Critical", cpu: 88, memory: 71, disk: 62, networkIn: 920, networkOut: 876, latencyMs: 84, packetLoss: 2.8, uptime: "130d 2h", lastCheckIn: "2026-03-24T10:14:00Z", heartbeatVersion: "agent-4.7.2", os: "Network OS 12.1", services: [{ name: "packet-engine", status: "Degraded" }, { name: "lldp", status: "Running" }, { name: "bgp", status: "Running" }], interfaces: [{ name: "eth1/47", rxMbps: 412, txMbps: 388, errors: 34 }, { name: "eth1/48", rxMbps: 326, txMbps: 352, errors: 12 }], volumes: [{ name: "/", usage: 62, freeGb: 18 }, { name: "/var", usage: 77, freeGb: 8 }], compliance: { patch: "At Risk", unsupportedOs: false, backup: "Failed", avEdr: "Covered", certificateDaysLeft: 11, staleAgent: false } },
  { id: "device-fw-edge-01", name: "FW-EDGE-01", siteId: "site-mumbai-dc1", siteName: "Mumbai-DC1", rackId: "net-rack-03", rackName: "NET-RACK-03", status: "Offline", cpu: 0, memory: 0, disk: 58, networkIn: 0, networkOut: 0, latencyMs: 0, packetLoss: 100, uptime: "8d 19h", lastCheckIn: "2026-03-24T09:56:00Z", heartbeatVersion: "agent-4.6.9", os: "Firewall OS 8.4", services: [{ name: "packet-engine", status: "Stopped" }, { name: "policy-sync", status: "Stopped" }, { name: "ha-link", status: "Degraded" }], interfaces: [{ name: "wan0", rxMbps: 0, txMbps: 0, errors: 18 }, { name: "lan-core", rxMbps: 0, txMbps: 0, errors: 44 }], volumes: [{ name: "/", usage: 58, freeGb: 12 }, { name: "/logs", usage: 81, freeGb: 3 }], compliance: { patch: "At Risk", unsupportedOs: false, backup: "Failed", avEdr: "Covered", certificateDaysLeft: 6, staleAgent: true } },
  { id: "device-nas-stor-01", name: "NAS-STOR-01", siteId: "site-frankfurt-dc1", siteName: "Frankfurt-DC1", rackId: "rack-b-07", rackName: "RACK-B-07", status: "Warning", cpu: 48, memory: 81, disk: 74, networkIn: 410, networkOut: 395, latencyMs: 28, packetLoss: 0.4, uptime: "90d 6h", lastCheckIn: "2026-03-24T10:10:00Z", heartbeatVersion: "agent-4.7.2", os: "Storage OS 9.4", services: [{ name: "backupd", status: "Degraded" }, { name: "nfs", status: "Running" }, { name: "smb", status: "Running" }], interfaces: [{ name: "bond0", rxMbps: 223, txMbps: 198, errors: 0 }, { name: "bond1", rxMbps: 187, txMbps: 197, errors: 1 }], volumes: [{ name: "vol-data", usage: 74, freeGb: 1280 }, { name: "vol-backup", usage: 83, freeGb: 640 }], compliance: { patch: "Compliant", unsupportedOs: false, backup: "Failed", avEdr: "Missing", certificateDaysLeft: 92, staleAgent: false } },
  { id: "device-srv-db-01", name: "SRV-DB-01", siteId: "site-mumbai-dc1", siteName: "Mumbai-DC1", rackId: "rack-a-01", rackName: "RACK-A-01", status: "Warning", cpu: 57, memory: 62, disk: 69, networkIn: 124, networkOut: 96, latencyMs: 22, packetLoss: 0.1, uptime: "24d 8h", lastCheckIn: "2026-03-24T10:11:00Z", heartbeatVersion: "agent-4.7.2", os: "Linux 8.8", services: [{ name: "postgresql", status: "Running" }, { name: "wal-archive", status: "Degraded" }, { name: "node-exporter", status: "Running" }], interfaces: [{ name: "eth0", rxMbps: 78, txMbps: 63, errors: 0 }, { name: "bond-db", rxMbps: 46, txMbps: 33, errors: 0 }], volumes: [{ name: "/", usage: 69, freeGb: 28 }, { name: "/var/lib/postgres", usage: 82, freeGb: 140 }], compliance: { patch: "Compliant", unsupportedOs: false, backup: "Healthy", avEdr: "Covered", certificateDaysLeft: 128, staleAgent: false } },
];

const siteTrends: Record<string, SiteOperationalSummary["trends"]> = {
  "site-virginia-dc3": { powerLoad: series(172, 176, 184, 188), coolingHealth: series(84, 82, 80, 78), alerts: series(3, 4, 5, 7), occupancy: series(82, 84, 85, 86) },
  "site-mumbai-dc1": { powerLoad: series(131, 135, 139, 142), coolingHealth: series(86, 85, 84, 83), alerts: series(1, 2, 2, 3), occupancy: series(75, 76, 78, 79) },
  "site-frankfurt-dc1": { powerLoad: series(118, 121, 123, 126), coolingHealth: series(94, 93, 92, 92), alerts: series(0, 1, 1, 2), occupancy: series(65, 66, 67, 68) },
};

const rackTrends: Record<string, RackOperationalSummary["trends"]> = {
  "net-rack-03": { temperature: series(34, 35, 38, 41), powerDraw: series(8.1, 8.4, 8.9, 9.6), alerts: series(1, 2, 2, 3), density: series(81, 82, 84, 88) },
  "rack-a-01": { temperature: series(30, 31, 32, 34), powerDraw: series(6.6, 6.8, 7.1, 7.4), alerts: series(0, 1, 1, 2), density: series(69, 70, 71, 73) },
  "rack-b-07": { temperature: series(28, 29, 30, 31), powerDraw: series(5.3, 5.5, 5.8, 6.1), alerts: series(0, 0, 1, 1), density: series(58, 59, 60, 61) },
};

const siteChecks: Record<string, string[]> = {
  "site-virginia-dc3": ["Cooling health remains below target.", "Two backup workflows need re-verification.", "Row 03 still carries the highest alert density."],
  "site-mumbai-dc1": ["Firewall availability is degrading user-path stability.", "Power headroom remains acceptable.", "Review stale agents during the next maintenance window."],
  "site-frankfurt-dc1": ["Backup drift is isolated to storage services.", "Cooling and network health are stable.", "No broad compliance drift detected."],
};

const rackRecommendations: Record<string, string[]> = {
  "net-rack-03": ["Open the impacted firewall or ToR switch in Systems for remote remediation.", "Shift non-critical traffic away from the hottest interfaces.", "Place the rack into maintenance if work will interrupt northbound connectivity."],
  "rack-a-01": ["Review SRV-DB-01 before the next peak window.", "Verify PDU headroom before adding more 2U servers.", "Watch alert concentration as occupancy rises."],
  "rack-b-07": ["Validate backup service health on NAS-STOR-01.", "Thermal conditions are stable.", "Use this rack as overflow capacity if neighboring zones heat up."],
};

const deviceRecommendations: Record<string, string[]> = {
  "device-sw-tor-02": ["Restart the packet-engine service if packet loss keeps climbing.", "Inspect the busiest uplinks and rebalance traffic.", "Escalate if the device remains critical after a restart."],
  "device-fw-edge-01": ["Open a remote session and verify HA state before rebooting.", "If heartbeat stays stale, isolate the host and fail over traffic.", "Review certificate expiry after connectivity is restored."],
  "device-nas-stor-01": ["Re-run the failed backup job and confirm repository throughput.", "Investigate degraded backupd service.", "Confirm AV/EDR coverage because it is currently missing."],
  "device-srv-db-01": ["Validate WAL archive latency and memory pressure.", "Plan capacity expansion before utilization crosses the next threshold.", "No containment action is needed if replication remains healthy."],
};

const rackSiteLookup: Record<string, string> = { "net-rack-03": "site-virginia-dc3", "rack-a-01": "site-mumbai-dc1", "rack-b-07": "site-frankfurt-dc1" };
const rackNameLookup = Object.fromEntries(seededRackMetrics.map((rack) => [rack.rackId, rack.rackName]));
const deviceLookup = Object.fromEntries(seededDevices.map((device) => [device.id, device]));

let alerts = seededAlerts.map((alert) => ({ ...alert }));
let activities: ActivityEvent[] = [
  { id: "EV-1", at: "2m ago", actor: "system", action: "Detected hotspot risk", target: "NET-RACK-03", impact: "Thermal risk raised to High", targetId: "net-rack-03", siteId: "site-virginia-dc3", rackId: "net-rack-03" },
  { id: "EV-2", at: "6m ago", actor: "NOC-Primary", action: "Acknowledged alert", target: "AL-2201", impact: "Incident ownership assigned", targetId: "AL-2201", siteId: "site-virginia-dc3", rackId: "net-rack-03" },
  { id: "EV-3", at: "14m ago", actor: "Backup Ops", action: "Reran backup job", target: "NAS-STOR-01", impact: "Backup verification pending", targetId: "device-nas-stor-01", siteId: "site-frankfurt-dc1", rackId: "rack-b-07", deviceId: "device-nas-stor-01" },
];
let timeline: ExecutionTimelineItem[] = [];

function formatActivityTime() {
  return "Just now";
}

function matchesFilters(alert: AlertItem, filters: OpsFilters) {
  const siteMetric = seededSiteMetrics.find((site) => site.siteId === alert.siteId);
  if (filters.severity !== "all" && alert.severity !== filters.severity) return false;
  if (filters.region !== "all" && alert.region !== filters.region) return false;
  if (filters.siteType !== "all" && siteMetric?.siteType !== filters.siteType) return false;
  if (filters.deviceType !== "all" && alert.deviceType !== filters.deviceType) return false;
  if (filters.compliance === "At Risk" && !["Critical", "Warning"].includes(alert.severity)) return false;
  return true;
}

function getAlertRackId(alert: AlertItem) {
  if (alert.entityType === "rack") return alert.entityId;
  if (alert.entityType === "device") return deviceLookup[alert.entityId]?.rackId ?? null;
  return null;
}

function matchesScope(alert: AlertItem, scope: EntityScope) {
  if (scope.deviceId) return alert.entityId === scope.deviceId;
  if (scope.rackId) return getAlertRackId(alert) === scope.rackId;
  if (scope.siteId) return alert.siteId === scope.siteId;
  if (scope.entityId) return alert.entityId === scope.entityId || alert.siteId === scope.entityId || getAlertRackId(alert) === scope.entityId;
  return true;
}

function matchesActivityScope(event: ActivityEvent, scope: EntityScope) {
  if (scope.deviceId) return event.deviceId === scope.deviceId || event.targetId === scope.deviceId;
  if (scope.rackId) return event.rackId === scope.rackId || event.targetId === scope.rackId;
  if (scope.siteId) return event.siteId === scope.siteId || event.targetId === scope.siteId;
  if (scope.entityId) return event.targetId === scope.entityId || event.siteId === scope.entityId || event.rackId === scope.entityId || event.deviceId === scope.entityId;
  return true;
}

function cloneTrend(points: TrendPoint[]) {
  return points.map((point) => ({ ...point }));
}

function toKpis(snapshot: { alerts: AlertItem[]; sites: SiteOpsMetric[]; racks: RackOpsMetric[] }) {
  const criticalAlerts = snapshot.alerts.filter((alert) => alert.severity === "Critical" && alert.status !== "Resolved").length;
  const warningAlerts = snapshot.alerts.filter((alert) => alert.severity === "Warning" && alert.status !== "Resolved").length;
  const offlineDevices = snapshot.alerts.filter((alert) => alert.title.toLowerCase().includes("offline") && alert.status !== "Resolved").length;
  const patchCompliance = Math.round(snapshot.sites.reduce((sum, site) => sum + site.patchCompliance, 0) / snapshot.sites.length);
  const backupSuccess = Math.max(0, 100 - snapshot.sites.reduce((sum, site) => sum + site.backupFailures, 0) * 6);
  const capacityRisk = snapshot.racks.filter((rack) => rack.usedU >= 35 || rack.hotspotRisk === "High").length;

  return [
    { label: "Total Devices", value: "643", tone: "info" as const },
    { label: "Online / Offline", value: `${643 - offlineDevices} / ${offlineDevices}`, tone: offlineDevices ? ("warning" as const) : ("healthy" as const) },
    { label: "Critical Alerts", value: String(criticalAlerts), tone: criticalAlerts ? ("critical" as const) : ("healthy" as const) },
    { label: "Warning Alerts", value: String(warningAlerts), tone: warningAlerts ? ("warning" as const) : ("healthy" as const) },
    { label: "Sites At Risk", value: String(snapshot.sites.filter((site) => site.networkHealth < 80 || site.coolingHealth < 80).length), tone: "warning" as const },
    { label: "Patch Compliance", value: `${patchCompliance}%`, tone: patchCompliance < 93 ? ("warning" as const) : ("healthy" as const) },
    { label: "Backup Success", value: `${backupSuccess}%`, tone: backupSuccess < 95 ? ("warning" as const) : ("healthy" as const) },
    { label: "Avg Uptime", value: "99.31%", tone: "healthy" as const },
    { label: "Capacity Risk", value: `${capacityRisk} racks`, tone: capacityRisk > 1 ? ("warning" as const) : ("info" as const) },
  ];
}

function makeSnapshot(scope: EntityScope) {
  const rackId = scope.rackId ?? (scope.deviceId ? deviceLookup[scope.deviceId]?.rackId : undefined);
  const siteId = scope.siteId ?? (rackId ? rackSiteLookup[rackId] : scope.deviceId ? deviceLookup[scope.deviceId]?.siteId : undefined);
  return {
    generatedAt: new Date().toISOString(),
    scope,
    site: siteId ? seededSiteMetrics.find((site) => site.siteId === siteId) ?? null : null,
    rack: rackId ? seededRackMetrics.find((rack) => rack.rackId === rackId) ?? null : null,
    device: scope.deviceId ? deviceLookup[scope.deviceId] ?? null : null,
    alerts: alerts.filter((alert) => matchesScope(alert, scope)),
    activity: activities.filter((event) => matchesActivityScope(event, scope)).slice(0, 6),
  };
}

export const OperationsMockService = {
  async getCommandCenter(filters: OpsFilters, _timeFilter: TimeFilter, savedView: string): Promise<CommandCenterSnapshot> {
    await wait();
    const scopedAlerts = alerts.filter((alert) => matchesFilters(alert, filters));
    const bySavedView =
      savedView === "Critical Sites"
        ? scopedAlerts.filter((alert) => alert.entityType === "site" || alert.severity === "Critical")
        : savedView === "High Temp Racks"
          ? scopedAlerts.filter((alert) => alert.title.toLowerCase().includes("temp") || alert.entityType === "rack")
          : savedView === "Offline Devices"
            ? scopedAlerts.filter((alert) => alert.title.toLowerCase().includes("offline"))
            : scopedAlerts;

    return {
      kpis: toKpis({ alerts, sites: seededSiteMetrics, racks: seededRackMetrics }),
      incidentSpotlight: alerts.find((alert) => alert.severity === "Critical" && alert.status === "Open") ?? null,
      topIssues: bySavedView.slice(0, 5).map((alert) => ({ ...alert })),
      activity: activities.slice(0, 8).map((event) => ({ ...event })),
      alerts: bySavedView.map((alert) => ({ ...alert })),
      sites: seededSiteMetrics.map((site) => ({ ...site })),
      racks: seededRackMetrics.map((rack) => ({ ...rack })),
    };
  },

  async getAlerts() {
    await wait();
    return alerts.map((alert) => ({ ...alert }));
  },

  async getScopedAlerts(scope: EntityScope, limit = 6) {
    await wait(120);
    return alerts.filter((alert) => matchesScope(alert, scope)).slice(0, limit).map((alert) => ({ ...alert }));
  },

  async getScopedActivity(scope: EntityScope, limit = 6) {
    await wait(120);
    return activities.filter((event) => matchesActivityScope(event, scope)).slice(0, limit).map((event) => ({ ...event }));
  },

  async updateAlert(alertId: string, action: "ack" | "mute" | "maintenance" | "assign", owner?: string) {
    await wait(180);
    alerts = alerts.map((alert) => {
      if (alert.id !== alertId) return alert;
      if (action === "ack") return { ...alert, status: "Acknowledged" };
      if (action === "mute") return { ...alert, status: "Muted" };
      if (action === "maintenance") return { ...alert, status: "In Maintenance" };
      if (action === "assign") return { ...alert, owner: owner ?? "Assigned Team" };
      return alert;
    });
    activities = [{ id: `EV-${Date.now()}`, at: formatActivityTime(), actor: owner ?? "Operator", action: `Alert ${action}`, target: alertId, impact: "Lifecycle updated", targetId: alertId }, ...activities];
  },

  async getSiteMetric(siteId: string) {
    await wait(160);
    const metric = seededSiteMetrics.find((site) => site.siteId === siteId) ?? null;
    return metric ? { ...metric } : null;
  },

  async getRackMetric(rackId: string) {
    await wait(160);
    const metric = seededRackMetrics.find((rack) => rack.rackId === rackId) ?? null;
    return metric ? { ...metric } : null;
  },

  async getSiteOperationalSummary(siteId: string): Promise<SiteOperationalSummary | null> {
    await wait();
    const metric = seededSiteMetrics.find((site) => site.siteId === siteId);
    if (!metric) return null;

    const topRacks = seededRackMetrics
      .filter((rack) => rackSiteLookup[rack.rackId] === siteId)
      .map((rack) => ({
        rackId: rack.rackId,
        rackName: rack.rackName,
        hotspotRisk: rack.hotspotRisk,
        alertCount: alerts.filter((alert) => matchesScope(alert, { rackId: rack.rackId })).length,
        temperatureC: rack.temperatureC,
      }))
      .sort((left, right) => right.alertCount - left.alertCount || right.temperatureC - left.temperatureC)
      .slice(0, 3);

    return {
      metric: { ...metric },
      alerts: alerts.filter((alert) => alert.siteId === siteId).slice(0, 5).map((alert) => ({ ...alert })),
      activity: activities.filter((event) => event.siteId === siteId).slice(0, 5).map((event) => ({ ...event })),
      trends: {
        powerLoad: cloneTrend(siteTrends[siteId]?.powerLoad ?? []),
        coolingHealth: cloneTrend(siteTrends[siteId]?.coolingHealth ?? []),
        alerts: cloneTrend(siteTrends[siteId]?.alerts ?? []),
        occupancy: cloneTrend(siteTrends[siteId]?.occupancy ?? []),
      },
      checks: [...(siteChecks[siteId] ?? [])],
      topRacks,
    };
  },

  async getRackOperationalSummary(rackId: string): Promise<RackOperationalSummary | null> {
    await wait();
    const metric = seededRackMetrics.find((rack) => rack.rackId === rackId);
    if (!metric) return null;

    const impactedDevices = seededDevices
      .filter((device) => device.rackId === rackId)
      .map((device) => ({
        id: device.id,
        name: device.name,
        status: device.status,
        alertCount: alerts.filter((alert) => alert.entityId === device.id).length,
        cpu: device.cpu,
        memory: device.memory,
        temperature: device.status === "Offline" ? 0 : Math.max(24, Math.round(device.cpu / 3)),
      }))
      .sort((left, right) => right.alertCount - left.alertCount || right.cpu - left.cpu)
      .slice(0, 4);

    return {
      metric: { ...metric },
      alerts: alerts.filter((alert) => matchesScope(alert, { rackId })).slice(0, 5).map((alert) => ({ ...alert })),
      activity: activities.filter((event) => event.rackId === rackId).slice(0, 5).map((event) => ({ ...event })),
      trends: {
        temperature: cloneTrend(rackTrends[rackId]?.temperature ?? []),
        powerDraw: cloneTrend(rackTrends[rackId]?.powerDraw ?? []),
        alerts: cloneTrend(rackTrends[rackId]?.alerts ?? []),
        density: cloneTrend(rackTrends[rackId]?.density ?? []),
      },
      impactedDevices,
      recommendations: [...(rackRecommendations[rackId] ?? [])],
    };
  },

  async getDeviceDetails(deviceId: string) {
    await wait();
    return seededDevices.find((device) => device.id === deviceId) ?? seededDevices[0] ?? null;
  },

  async getDeviceOperationalSummary(deviceId: string): Promise<DeviceOperationalSummary | null> {
    await wait();
    const device = seededDevices.find((item) => item.id === deviceId);
    if (!device) return null;

    return {
      device: { ...device },
      alerts: alerts.filter((alert) => matchesScope(alert, { deviceId })).slice(0, 4).map((alert) => ({ ...alert })),
      activity: activities.filter((event) => matchesActivityScope(event, { deviceId })).slice(0, 5).map((event) => ({ ...event })),
      recommendedActions: [...(deviceRecommendations[deviceId] ?? [])],
    };
  },

  async getExecutionTimeline() {
    await wait(80);
    return timeline.slice(0, 8).map((item) => ({ ...item }));
  },

  async runRemoteAction(deviceId: string, action: RemoteAction) {
    await wait(120);
    const id = `ACT-${Date.now()}`;
    timeline = [{ id, action, status: "Running", startedAt: new Date().toISOString(), result: "Executing" }, ...timeline];
    await wait(450);
    timeline = timeline.map((item) => item.id === id ? { ...item, status: "Completed", endedAt: new Date().toISOString(), result: `${action} completed successfully` } : item);
    if (action === "Maintenance Mode") alerts = alerts.map((alert) => (alert.entityId === deviceId ? { ...alert, status: "In Maintenance" } : alert));
    if (action === "Restart Service") alerts = alerts.map((alert) => (alert.entityId === deviceId && alert.status === "Open" ? { ...alert, status: "Acknowledged" } : alert));
    activities = [{ id: `EV-${Date.now()}`, at: formatActivityTime(), actor: "Infra Admin", action, target: deviceLookup[deviceId]?.name ?? deviceId, impact: "Action workflow completed", targetId: deviceId, siteId: deviceLookup[deviceId]?.siteId, rackId: deviceLookup[deviceId]?.rackId, deviceId }, ...activities];
  },

  async runHealthCheck(scope: { entityType: "site" | "rack"; entityId: string }): Promise<HealthCheckResult> {
    await wait(220);
    const findings = scope.entityType === "site" ? siteChecks[scope.entityId] ?? [] : rackRecommendations[scope.entityId] ?? [];
    const target = scope.entityType === "site" ? seededSiteMetrics.find((site) => site.siteId === scope.entityId)?.siteName ?? scope.entityId : rackNameLookup[scope.entityId] ?? scope.entityId;
    activities = [{ id: `EV-${Date.now()}`, at: formatActivityTime(), actor: "RackVision", action: "Ran validation checks", target, impact: findings[0] ?? "No new issues detected", targetId: scope.entityId, siteId: scope.entityType === "site" ? scope.entityId : rackSiteLookup[scope.entityId], rackId: scope.entityType === "rack" ? scope.entityId : undefined }, ...activities];
    return { title: `${target} checks complete`, findings: findings.slice(0, 3), executedAt: new Date().toISOString() };
  },

  async setMaintenance(scope: { entityType: "site" | "rack" | "device"; entityId: string }) {
    await wait(160);
    let updatedAlerts = 0;
    alerts = alerts.map((alert) => {
      const matches =
        scope.entityType === "site"
          ? alert.siteId === scope.entityId
          : scope.entityType === "rack"
            ? matchesScope(alert, { rackId: scope.entityId })
            : alert.entityId === scope.entityId;
      if (!matches) return alert;
      updatedAlerts += 1;
      return { ...alert, status: "In Maintenance" };
    });

    const target = scope.entityType === "site" ? seededSiteMetrics.find((site) => site.siteId === scope.entityId)?.siteName ?? scope.entityId : scope.entityType === "rack" ? rackNameLookup[scope.entityId] ?? scope.entityId : deviceLookup[scope.entityId]?.name ?? scope.entityId;
    activities = [{ id: `EV-${Date.now()}`, at: formatActivityTime(), actor: "RackVision", action: "Entered maintenance", target, impact: `${updatedAlerts} related alert${updatedAlerts === 1 ? "" : "s"} moved into maintenance`, targetId: scope.entityId, siteId: scope.entityType === "site" ? scope.entityId : scope.entityType === "rack" ? rackSiteLookup[scope.entityId] : deviceLookup[scope.entityId]?.siteId, rackId: scope.entityType === "rack" ? scope.entityId : deviceLookup[scope.entityId]?.rackId, deviceId: scope.entityType === "device" ? scope.entityId : undefined }, ...activities];
    return { updatedAlerts, message: updatedAlerts ? "Related alerts moved into maintenance." : "No active alerts were linked to this scope." };
  },

  async exportScopeSnapshot(scope: EntityScope) {
    await wait(100);
    return JSON.stringify(makeSnapshot(scope), null, 2);
  },

  async simulateLiveTick() {
    await wait(60);
    alerts = alerts.map((alert, index) => alert.status === "Resolved" ? alert : { ...alert, ageMinutes: alert.ageMinutes + (index % 2 === 0 ? 1 : 0) });
    if (Math.random() > 0.65) activities = [{ id: `EV-${Date.now()}`, at: formatActivityTime(), actor: "system", action: "Health re-evaluation", target: "estate", impact: "Alert counters refreshed" }, ...activities].slice(0, 20);
    return {
      activeCritical: alerts.filter((alert) => alert.severity === "Critical" && alert.status !== "Resolved").length,
      openAlerts: alerts.filter((alert) => ["Open", "Acknowledged"].includes(alert.status)).length,
      activityCount: activities.length,
    };
  },

  formatAlertAge(minutes: number) {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  },

  getRolePreset(role: UserRolePreset): Partial<OpsFilters> {
    if (role === "NOC") return { severity: "Critical", compliance: "At Risk" };
    if (role === "Infra Admin") return { deviceType: "Server-2U", severity: "all" };
    return { severity: "Warning", region: "all" };
  },
};
