import {
  activityFeed,
  alertRows,
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
