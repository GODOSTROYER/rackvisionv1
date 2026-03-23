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

export type InfraStatus = "Healthy" | "Warning" | "Critical" | "Offline" | "Maintenance";

export type InfraRegion = {
  id: string;
  name: string;
  dataCenters: number;
  racks: number;
  devices: number;
  healthy: number;
  warning: number;
  critical: number;
  alerts: number;
  capacityUsed: number;
  powerKw: number;
  thermalState: string;
  lastSync: string;
};

export type InfraSite = {
  id: string;
  name: string;
  regionId: string;
  city: string;
  country: string;
  facilityType: string;
  roomsCount: number;
  rowsCount: number;
  racksCount: number;
  devicesCount: number;
  powerCapacityKw: number;
  coolingStatus: string;
  occupancy: number;
  activeAlerts: number;
  avgTemperature: number;
  powerUtilization: number;
  networkLoad: number;
  healthScore: number;
  status: InfraStatus;
  markerX: number;
  markerY: number;
  lastAudit: string;
};

export type InfraRoom = {
  id: string;
  siteId: string;
  name: string;
  rowsCount: number;
  racksCount: number;
  status: InfraStatus;
};

export type InfraRow = {
  id: string;
  roomId: string;
  name: string;
  rackCount: number;
  criticalAlerts: number;
  status: InfraStatus;
};

export type InfraRack = {
  id: string;
  siteId: string;
  roomId: string;
  rowId: string;
  name: string;
  occupancy: number;
  deviceCount: number;
  status: InfraStatus;
  temperature: number;
  powerUsageKw: number;
  alerts: number;
};

export type InfraDeviceType =
  | "1U Server"
  | "2U Server"
  | "4U Appliance"
  | "Storage Unit"
  | "Top-of-Rack Switch"
  | "Firewall"
  | "PDU"
  | "Blank Panel";

export type InfraDevice = {
  id: string;
  systemId: string;
  hostname: string;
  displayName: string;
  deviceType: InfraDeviceType;
  siteId: string;
  roomId: string;
  rowId: string;
  rackId: string;
  rackUnitStart: number;
  rackUnitSize: number;
  status: InfraStatus;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  temperature: number;
  networkInMbps: number;
  networkOutMbps: number;
  uptime: string;
  alertsCount: number;
  powerState: "On" | "Standby" | "Off";
  osPlatform: string;
  ipAddress: string;
  healthSummary: string;
};

export const infrastructureRegions: InfraRegion[] = [
  {
    id: "ap-south",
    name: "AP-South",
    dataCenters: 2,
    racks: 28,
    devices: 312,
    healthy: 268,
    warning: 31,
    critical: 13,
    alerts: 22,
    capacityUsed: 74,
    powerKw: 412,
    thermalState: "Nominal",
    lastSync: "2m ago",
  },
  {
    id: "us-east",
    name: "US-East",
    dataCenters: 1,
    racks: 16,
    devices: 184,
    healthy: 160,
    warning: 18,
    critical: 6,
    alerts: 11,
    capacityUsed: 68,
    powerKw: 256,
    thermalState: "Stable",
    lastSync: "4m ago",
  },
  {
    id: "eu-west",
    name: "EU-West",
    dataCenters: 1,
    racks: 14,
    devices: 149,
    healthy: 131,
    warning: 12,
    critical: 6,
    alerts: 9,
    capacityUsed: 71,
    powerKw: 221,
    thermalState: "Watch",
    lastSync: "3m ago",
  },
];

export const infrastructureSites: InfraSite[] = [
  {
    id: "mumbai-dc1",
    name: "Mumbai-DC1",
    regionId: "ap-south",
    city: "Mumbai",
    country: "India",
    facilityType: "Colocation",
    roomsCount: 2,
    rowsCount: 6,
    racksCount: 16,
    devicesCount: 188,
    powerCapacityKw: 240,
    coolingStatus: "Optimal",
    occupancy: 79,
    activeAlerts: 10,
    avgTemperature: 24,
    powerUtilization: 72,
    networkLoad: 66,
    healthScore: 92,
    status: "Healthy",
    markerX: 70,
    markerY: 52,
    lastAudit: "2026-03-18",
  },
  {
    id: "pune-dc2",
    name: "Pune-DC2",
    regionId: "ap-south",
    city: "Pune",
    country: "India",
    facilityType: "Private Facility",
    roomsCount: 1,
    rowsCount: 4,
    racksCount: 12,
    devicesCount: 124,
    powerCapacityKw: 172,
    coolingStatus: "Nominal",
    occupancy: 68,
    activeAlerts: 12,
    avgTemperature: 26,
    powerUtilization: 75,
    networkLoad: 59,
    healthScore: 86,
    status: "Warning",
    markerX: 69,
    markerY: 54,
    lastAudit: "2026-03-16",
  },
  {
    id: "frankfurt-dc1",
    name: "Frankfurt-DC1",
    regionId: "eu-west",
    city: "Frankfurt",
    country: "Germany",
    facilityType: "Colocation",
    roomsCount: 1,
    rowsCount: 4,
    racksCount: 14,
    devicesCount: 149,
    powerCapacityKw: 198,
    coolingStatus: "Optimal",
    occupancy: 71,
    activeAlerts: 9,
    avgTemperature: 23,
    powerUtilization: 69,
    networkLoad: 63,
    healthScore: 89,
    status: "Healthy",
    markerX: 53,
    markerY: 36,
    lastAudit: "2026-03-14",
  },
  {
    id: "virginia-dc3",
    name: "Virginia-DC3",
    regionId: "us-east",
    city: "Ashburn",
    country: "USA",
    facilityType: "Hyperscale Cage",
    roomsCount: 1,
    rowsCount: 3,
    racksCount: 16,
    devicesCount: 184,
    powerCapacityKw: 210,
    coolingStatus: "Watch",
    occupancy: 65,
    activeAlerts: 11,
    avgTemperature: 27,
    powerUtilization: 77,
    networkLoad: 71,
    healthScore: 84,
    status: "Warning",
    markerX: 27,
    markerY: 39,
    lastAudit: "2026-03-17",
  },
];

export const infrastructureRooms: InfraRoom[] = [
  { id: "m-dc1-room-a", siteId: "mumbai-dc1", name: "Room A", rowsCount: 3, racksCount: 9, status: "Healthy" },
  { id: "m-dc1-room-b", siteId: "mumbai-dc1", name: "Room B", rowsCount: 3, racksCount: 7, status: "Warning" },
  { id: "p-dc2-room-a", siteId: "pune-dc2", name: "Room A", rowsCount: 2, racksCount: 7, status: "Warning" },
  { id: "f-dc1-room-a", siteId: "frankfurt-dc1", name: "Room A", rowsCount: 4, racksCount: 14, status: "Healthy" },
  { id: "v-dc3-room-a", siteId: "virginia-dc3", name: "Room A", rowsCount: 3, racksCount: 16, status: "Warning" },
];

export const infrastructureRows: InfraRow[] = [
  { id: "m-dc1-row-01", roomId: "m-dc1-room-a", name: "Row 01", rackCount: 3, criticalAlerts: 1, status: "Healthy" },
  { id: "m-dc1-row-02", roomId: "m-dc1-room-a", name: "Row 02", rackCount: 3, criticalAlerts: 0, status: "Healthy" },
  { id: "m-dc1-row-03", roomId: "m-dc1-room-b", name: "Row 03", rackCount: 4, criticalAlerts: 2, status: "Warning" },
  { id: "p-dc2-row-01", roomId: "p-dc2-room-a", name: "Row 01", rackCount: 4, criticalAlerts: 1, status: "Warning" },
  { id: "f-dc1-row-01", roomId: "f-dc1-room-a", name: "Row 01", rackCount: 6, criticalAlerts: 1, status: "Healthy" },
  { id: "v-dc3-row-01", roomId: "v-dc3-room-a", name: "Row 01", rackCount: 5, criticalAlerts: 2, status: "Warning" },
];

export const infrastructureRacks: InfraRack[] = [
  {
    id: "rack-a-01",
    siteId: "mumbai-dc1",
    roomId: "m-dc1-room-a",
    rowId: "m-dc1-row-01",
    name: "RACK-A-01",
    occupancy: 81,
    deviceCount: 12,
    status: "Healthy",
    temperature: 24,
    powerUsageKw: 9.1,
    alerts: 1,
  },
  {
    id: "rack-a-02",
    siteId: "mumbai-dc1",
    roomId: "m-dc1-room-a",
    rowId: "m-dc1-row-01",
    name: "RACK-A-02",
    occupancy: 74,
    deviceCount: 10,
    status: "Warning",
    temperature: 27,
    powerUsageKw: 8.3,
    alerts: 3,
  },
  {
    id: "rack-b-07",
    siteId: "pune-dc2",
    roomId: "p-dc2-room-a",
    rowId: "p-dc2-row-01",
    name: "RACK-B-07",
    occupancy: 63,
    deviceCount: 8,
    status: "Warning",
    temperature: 28,
    powerUsageKw: 6.4,
    alerts: 2,
  },
  {
    id: "net-rack-03",
    siteId: "virginia-dc3",
    roomId: "v-dc3-room-a",
    rowId: "v-dc3-row-01",
    name: "NET-RACK-03",
    occupancy: 69,
    deviceCount: 9,
    status: "Critical",
    temperature: 31,
    powerUsageKw: 7.6,
    alerts: 4,
  },
];

export const infrastructureDevices: InfraDevice[] = [
  {
    id: "dev-srv-db-01",
    systemId: "SYS-1001",
    hostname: "SRV-DB-01",
    displayName: "Database Cluster Node",
    deviceType: "2U Server",
    siteId: "mumbai-dc1",
    roomId: "m-dc1-room-a",
    rowId: "m-dc1-row-01",
    rackId: "rack-a-01",
    rackUnitStart: 2,
    rackUnitSize: 2,
    status: "Healthy",
    cpuUsage: 41,
    memoryUsage: 63,
    storageUsage: 72,
    temperature: 23,
    networkInMbps: 148,
    networkOutMbps: 121,
    uptime: "43d 12h",
    alertsCount: 0,
    powerState: "On",
    osPlatform: "Ubuntu 22.04",
    ipAddress: "10.12.4.21",
    healthSummary: "Operating within normal thresholds.",
  },
  {
    id: "dev-srv-web-04",
    systemId: "SYS-1003",
    hostname: "SRV-WEB-04",
    displayName: "Web Frontend Node",
    deviceType: "1U Server",
    siteId: "mumbai-dc1",
    roomId: "m-dc1-room-a",
    rowId: "m-dc1-row-01",
    rackId: "rack-a-01",
    rackUnitStart: 6,
    rackUnitSize: 1,
    status: "Warning",
    cpuUsage: 76,
    memoryUsage: 68,
    storageUsage: 58,
    temperature: 27,
    networkInMbps: 193,
    networkOutMbps: 186,
    uptime: "12d 4h",
    alertsCount: 2,
    powerState: "On",
    osPlatform: "Windows Server 2022",
    ipAddress: "10.12.4.34",
    healthSummary: "CPU spikes observed during peak traffic.",
  },
  {
    id: "dev-hv-node-02",
    systemId: "SYS-1005",
    hostname: "HV-NODE-02",
    displayName: "Hypervisor Host 02",
    deviceType: "4U Appliance",
    siteId: "pune-dc2",
    roomId: "p-dc2-room-a",
    rowId: "p-dc2-row-01",
    rackId: "rack-b-07",
    rackUnitStart: 10,
    rackUnitSize: 4,
    status: "Critical",
    cpuUsage: 92,
    memoryUsage: 88,
    storageUsage: 81,
    temperature: 31,
    networkInMbps: 256,
    networkOutMbps: 220,
    uptime: "5d 19h",
    alertsCount: 4,
    powerState: "On",
    osPlatform: "VMware ESXi",
    ipAddress: "10.22.8.12",
    healthSummary: "High utilization and thermal threshold breach.",
  },
  {
    id: "dev-nas-stor-01",
    systemId: "SYS-1004",
    hostname: "NAS-STOR-01",
    displayName: "Primary Storage Array",
    deviceType: "Storage Unit",
    siteId: "virginia-dc3",
    roomId: "v-dc3-room-a",
    rowId: "v-dc3-row-01",
    rackId: "net-rack-03",
    rackUnitStart: 16,
    rackUnitSize: 4,
    status: "Offline",
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 84,
    temperature: 0,
    networkInMbps: 0,
    networkOutMbps: 0,
    uptime: "0d 0h",
    alertsCount: 3,
    powerState: "Off",
    osPlatform: "TrueNAS",
    ipAddress: "10.40.2.50",
    healthSummary: "Device unreachable; awaiting remote hands check.",
  },
  {
    id: "dev-fw-edge-01",
    systemId: "SYS-1002",
    hostname: "FW-EDGE-01",
    displayName: "Edge Security Appliance",
    deviceType: "Firewall",
    siteId: "virginia-dc3",
    roomId: "v-dc3-room-a",
    rowId: "v-dc3-row-01",
    rackId: "net-rack-03",
    rackUnitStart: 30,
    rackUnitSize: 2,
    status: "Warning",
    cpuUsage: 64,
    memoryUsage: 71,
    storageUsage: 49,
    temperature: 29,
    networkInMbps: 328,
    networkOutMbps: 302,
    uptime: "91d 6h",
    alertsCount: 1,
    powerState: "On",
    osPlatform: "FortiOS",
    ipAddress: "172.16.10.1",
    healthSummary: "Packet drops detected on WAN uplink.",
  },
  {
    id: "dev-sw-tor-02",
    systemId: "SYS-1001",
    hostname: "SW-TOR-02",
    displayName: "Top-of-Rack Switch 02",
    deviceType: "Top-of-Rack Switch",
    siteId: "mumbai-dc1",
    roomId: "m-dc1-room-a",
    rowId: "m-dc1-row-01",
    rackId: "rack-a-01",
    rackUnitStart: 41,
    rackUnitSize: 1,
    status: "Healthy",
    cpuUsage: 36,
    memoryUsage: 44,
    storageUsage: 31,
    temperature: 24,
    networkInMbps: 411,
    networkOutMbps: 397,
    uptime: "120d 2h",
    alertsCount: 0,
    powerState: "On",
    osPlatform: "NX-OS",
    ipAddress: "10.12.4.2",
    healthSummary: "Core switching healthy with stable throughput.",
  },
];
