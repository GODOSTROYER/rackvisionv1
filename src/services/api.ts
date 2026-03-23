import {
  activityFeed,
  alertRows,
  infrastructureDevices,
  infrastructureRacks,
  infrastructureRegions,
  infrastructureRooms,
  infrastructureRows,
  infrastructureSites,
  integrations,
  kpis,
  statusSplit,
  systemsRows,
  uptimeTrend,
  workflowRows,
} from "@/data/mockData";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDashboardSummary() {
  await wait();
  return { kpis, statusSplit, uptimeTrend, alerts: alertRows, activity: activityFeed };
}

export async function getAlerts() {
  await wait();
  return alertRows;
}

export async function getPatchStatus() {
  await wait();
  return { compliant: 92.4, pending: 5.9, failed: 1.7 };
}

export async function getSystems() {
  await wait();
  return systemsRows;
}

export async function getNetworkDevices() {
  await wait();
  return systemsRows.map((d) => ({ ...d, type: "Switch/Firewall" }));
}

export async function getAutomationWorkflows() {
  await wait();
  return workflowRows;
}

export async function getReports() {
  await wait();
  return [
    { id: "REP-11", name: "Weekly Executive Summary", schedule: "Mondays 08:00", status: "Scheduled" },
    { id: "REP-12", name: "Patch Compliance by Site", schedule: "Daily 06:00", status: "Scheduled" },
    { id: "REP-13", name: "Threat Drift", schedule: "Manual", status: "Draft" },
  ];
}

export async function getThreats() {
  await wait();
  return [
    { id: "TH-90", severity: "Critical", endpoint: "SRV-DC-01", threat: "Ransomware behavior" },
    { id: "TH-91", severity: "Warning", endpoint: "FIN-LT-12", threat: "Suspicious PowerShell" },
  ];
}

export async function getIntegrations() {
  await wait();
  return integrations;
}

export async function saveSettings() {
  await wait(450);
  return { ok: true };
}

export async function exportReport() {
  await wait(450);
  return { ok: true };
}

export async function runWorkflow() {
  await wait(450);
  return { ok: true };
}

export async function getInfrastructureSummary() {
  await wait();
  const totalSites = infrastructureSites.length;
  const totalRacks = infrastructureRacks.length;
  const totalDevices = infrastructureDevices.length;
  const criticalAlerts = infrastructureDevices.reduce((acc, d) => acc + (d.status === "Critical" ? d.alertsCount : 0), 0);
  const online = infrastructureDevices.filter((d) => d.status !== "Offline").length;
  const offline = infrastructureDevices.filter((d) => d.status === "Offline").length;
  return {
    totalRegions: infrastructureRegions.length,
    totalSites,
    totalRacks,
    totalDevices,
    criticalAlerts,
    capacityUsed: Math.round(
      infrastructureRacks.reduce((acc, rack) => acc + rack.occupancy, 0) / Math.max(infrastructureRacks.length, 1),
    ),
    online,
    offline,
    powerThermal: `${infrastructureSites.reduce((acc, site) => acc + site.powerUtilization, 0)}% aggregate load`,
  };
}

export async function getRegions() {
  await wait();
  return infrastructureRegions;
}

export async function getRegionDetails(regionId: string) {
  await wait();
  return infrastructureRegions.find((region) => region.id === regionId) ?? null;
}

export async function getSites(regionId?: string) {
  await wait();
  if (!regionId) return infrastructureSites;
  return infrastructureSites.filter((site) => site.regionId === regionId);
}

export async function getSiteDetails(siteId: string) {
  await wait();
  return infrastructureSites.find((site) => site.id === siteId) ?? null;
}

export async function getRooms(siteId: string) {
  await wait();
  return infrastructureRooms.filter((room) => room.siteId === siteId);
}

export async function getRows(roomId: string) {
  await wait();
  return infrastructureRows.filter((row) => row.roomId === roomId);
}

export async function getRacks(rowId?: string) {
  await wait();
  if (!rowId) return infrastructureRacks;
  return infrastructureRacks.filter((rack) => rack.rowId === rowId);
}

export async function getRackDetails(rackId: string) {
  await wait();
  return infrastructureRacks.find((rack) => rack.id === rackId) ?? null;
}

export async function getRackDevices(rackId: string) {
  await wait();
  return infrastructureDevices.filter((device) => device.rackId === rackId);
}

export async function getDevicePreview(deviceId: string) {
  await wait();
  return infrastructureDevices.find((device) => device.id === deviceId) ?? null;
}

export async function navigateToSystemDetails(deviceId: string) {
  await wait(120);
  const device = infrastructureDevices.find((d) => d.id === deviceId);
  return { path: `/systems/${device?.systemId ?? "SYS-1001"}` };
}
