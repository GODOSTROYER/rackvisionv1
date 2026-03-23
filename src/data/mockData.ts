export type Tone = "healthy" | "warning" | "critical" | "offline" | "info" | "default";

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  tone?: Tone;
};

export const kpis: Kpi[] = [
  { label: "Active Alerts", value: "128", delta: "+12", tone: "critical" },
  { label: "Protected Endpoints", value: "1,284", delta: "+1.8%", tone: "healthy" },
  { label: "Patch Compliance", value: "92.4%", delta: "+3.2%", tone: "healthy" },
  { label: "Automations Run", value: "378", delta: "+24", tone: "info" },
];

export const statusSplit = [
  { name: "Healthy", value: 78, fill: "hsl(var(--healthy))" },
  { name: "Warning", value: 14, fill: "hsl(var(--warning))" },
  { name: "Critical", value: 8, fill: "hsl(var(--critical))" },
];

export const uptimeTrend = [
  { name: "Mon", uptime: 98.9, incidents: 8 },
  { name: "Tue", uptime: 99.2, incidents: 5 },
  { name: "Wed", uptime: 98.7, incidents: 11 },
  { name: "Thu", uptime: 99.4, incidents: 4 },
  { name: "Fri", uptime: 99.1, incidents: 6 },
  { name: "Sat", uptime: 99.7, incidents: 2 },
  { name: "Sun", uptime: 99.5, incidents: 3 },
];

export const alertRows = [
  { id: "AL-9014", severity: "Critical", device: "SRV-DC-01", site: "HQ", message: "CPU above 95%", age: "2m" },
  { id: "AL-9011", severity: "Warning", device: "FIN-LT-12", site: "Finance", message: "Disk usage 86%", age: "8m" },
  { id: "AL-9008", severity: "Critical", device: "Office-Firewall-01", site: "HQ", message: "Packet drops spike", age: "17m" },
  { id: "AL-9004", severity: "Info", device: "RMM-Agent-104", site: "Remote", message: "Agent restarted", age: "26m" },
];

export const systemsRows = [
  { id: "SYS-1001", name: "SRV-DC-01", os: "Windows Server 2022", status: "Healthy", group: "Domain", site: "HQ" },
  { id: "SYS-1002", name: "FIN-LT-12", os: "Windows 11", status: "Warning", group: "Finance", site: "NYC" },
  { id: "SYS-1003", name: "OPS-WS-08", os: "Windows 10", status: "Healthy", group: "Operations", site: "Austin" },
  { id: "SYS-1004", name: "HR-MAC-04", os: "macOS Sonoma", status: "Offline", group: "HR", site: "Remote" },
  { id: "SYS-1005", name: "RMM-Agent-104", os: "Ubuntu 22.04", status: "Critical", group: "Linux", site: "DC-2" },
];

export const workflowRows = [
  { id: "WF-201", name: "Restart Stalled Services", trigger: "Service Alert", status: "Active", runs: "112" },
  { id: "WF-202", name: "Patch Approval Sync", trigger: "Daily 02:00", status: "Active", runs: "31" },
  { id: "WF-203", name: "Disk Cleanup", trigger: "Threshold", status: "Draft", runs: "0" },
];

export const integrations = [
  { name: "Slack", status: "Connected" },
  { name: "Zendesk", status: "Connected" },
  { name: "PagerDuty", status: "Disconnected" },
  { name: "Autotask", status: "Connected" },
  { name: "ConnectWise", status: "Disconnected" },
  { name: "IT Glue", status: "Connected" },
  { name: "Bitdefender", status: "Connected" },
  { name: "Webroot", status: "Disconnected" },
];

export const activityFeed = [
  { title: "Patch KB5038879 approved for Production", time: "4m ago", tag: "Patch" },
  { title: "Workflow WF-201 executed on 14 endpoints", time: "12m ago", tag: "Automation" },
  { title: "New critical alert on SRV-DC-01", time: "19m ago", tag: "Alert" },
  { title: "Office-Firewall-01 back online", time: "31m ago", tag: "Network" },
];
