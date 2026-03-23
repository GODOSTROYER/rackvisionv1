import {
  BreadcrumbItem,
  Device,
  HealthStatus,
  HierarchyNode,
  Rack,
  RackVisionEntity,
  RackVisionEntityKind,
  Region,
  Room,
  Row,
  Site,
} from "@/components/rackvision/types";

const DELAY_MS = 300;

const wait = async (ms = DELAY_MS) => new Promise((resolve) => window.setTimeout(resolve, ms));

const regions: Region[] = [
  { id: "region-ap-south", name: "AP-South", code: "AP", kind: "region", parentId: null, healthStatus: "Warning" },
  { id: "region-us-east", name: "US-East", code: "US", kind: "region", parentId: null, healthStatus: "Healthy" },
  { id: "region-eu-west", name: "EU-West", code: "EU", kind: "region", parentId: null, healthStatus: "Healthy" },
];

const sites: Site[] = [
  {
    id: "site-mumbai-dc1",
    name: "Mumbai-DC1",
    kind: "site",
    parentId: "region-ap-south",
    regionId: "region-ap-south",
    city: "Mumbai",
    country: "India",
    healthStatus: "Warning",
  },
  {
    id: "site-frankfurt-dc1",
    name: "Frankfurt-DC1",
    kind: "site",
    parentId: "region-eu-west",
    regionId: "region-eu-west",
    city: "Frankfurt",
    country: "Germany",
    healthStatus: "Healthy",
  },
  {
    id: "site-virginia-dc3",
    name: "Virginia-DC3",
    kind: "site",
    parentId: "region-us-east",
    regionId: "region-us-east",
    city: "Ashburn",
    country: "USA",
    healthStatus: "Critical",
  },
];

const rooms: Room[] = [
  { id: "room-mumbai-a", name: "Room A", kind: "room", parentId: "site-mumbai-dc1", siteId: "site-mumbai-dc1", healthStatus: "Warning" },
  { id: "room-frankfurt-a", name: "Room A", kind: "room", parentId: "site-frankfurt-dc1", siteId: "site-frankfurt-dc1", healthStatus: "Healthy" },
  { id: "room-virginia-b", name: "Room B", kind: "room", parentId: "site-virginia-dc3", siteId: "site-virginia-dc3", healthStatus: "Critical" },
];

const rows: Row[] = [
  { id: "row-mumbai-01", name: "Row 01", kind: "row", parentId: "room-mumbai-a", roomId: "room-mumbai-a", healthStatus: "Warning" },
  { id: "row-frankfurt-02", name: "Row 02", kind: "row", parentId: "room-frankfurt-a", roomId: "room-frankfurt-a", healthStatus: "Healthy" },
  { id: "row-virginia-03", name: "Row 03", kind: "row", parentId: "room-virginia-b", roomId: "room-virginia-b", healthStatus: "Critical" },
];

const racks: Rack[] = [
  {
    id: "rack-a-01",
    name: "RACK-A-01",
    kind: "rack",
    parentId: "row-mumbai-01",
    rowId: "row-mumbai-01",
    totalUnits: 42,
    occupancyPercent: 78,
    healthStatus: "Warning",
  },
  {
    id: "rack-b-07",
    name: "RACK-B-07",
    kind: "rack",
    parentId: "row-frankfurt-02",
    rowId: "row-frankfurt-02",
    totalUnits: 42,
    occupancyPercent: 64,
    healthStatus: "Healthy",
  },
  {
    id: "net-rack-03",
    name: "NET-RACK-03",
    kind: "rack",
    parentId: "row-virginia-03",
    rowId: "row-virginia-03",
    totalUnits: 42,
    occupancyPercent: 85,
    healthStatus: "Critical",
  },
];

const devices: Device[] = [
  {
    id: "device-srv-db-01",
    name: "SRV-DB-01",
    kind: "device",
    parentId: "rack-a-01",
    rackId: "rack-a-01",
    rackUnitStart: 38,
    rackUnitSize: 2,
    deviceType: "Server-2U",
    ipAddress: "10.12.1.14",
    osPlatform: "Linux",
    cpuUsage: 57,
    memoryUsage: 62,
    networkIo: "220 Mbps",
    temperature: 33,
    uptime: "24d 8h",
    alertCount: 2,
    powerState: "On",
    healthStatus: "Warning",
  },
  {
    id: "device-srv-web-04",
    name: "SRV-WEB-04",
    kind: "device",
    parentId: "rack-a-01",
    rackId: "rack-a-01",
    rackUnitStart: 34,
    rackUnitSize: 1,
    deviceType: "Server-1U",
    ipAddress: "10.12.1.44",
    osPlatform: "Windows Server",
    cpuUsage: 41,
    memoryUsage: 54,
    networkIo: "180 Mbps",
    temperature: 30,
    uptime: "41d 2h",
    alertCount: 0,
    powerState: "On",
    healthStatus: "Healthy",
  },
  {
    id: "device-hv-node-02",
    name: "HV-NODE-02",
    kind: "device",
    parentId: "rack-b-07",
    rackId: "rack-b-07",
    rackUnitStart: 28,
    rackUnitSize: 4,
    deviceType: "Appliance-4U",
    ipAddress: "172.20.5.22",
    osPlatform: "Hypervisor",
    cpuUsage: 69,
    memoryUsage: 72,
    networkIo: "320 Mbps",
    temperature: 36,
    uptime: "12d 11h",
    alertCount: 3,
    powerState: "On",
    healthStatus: "Warning",
  },
  {
    id: "device-nas-stor-01",
    name: "NAS-STOR-01",
    kind: "device",
    parentId: "rack-b-07",
    rackId: "rack-b-07",
    rackUnitStart: 20,
    rackUnitSize: 4,
    deviceType: "Storage",
    ipAddress: "172.20.5.80",
    osPlatform: "Storage OS",
    cpuUsage: 48,
    memoryUsage: 81,
    networkIo: "410 Mbps",
    temperature: 34,
    uptime: "90d 6h",
    alertCount: 1,
    powerState: "On",
    healthStatus: "Healthy",
  },
  {
    id: "device-sw-tor-02",
    name: "SW-TOR-02",
    kind: "device",
    parentId: "net-rack-03",
    rackId: "net-rack-03",
    rackUnitStart: 41,
    rackUnitSize: 1,
    deviceType: "Switch-ToR",
    ipAddress: "10.77.3.2",
    osPlatform: "Network OS",
    cpuUsage: 23,
    memoryUsage: 37,
    networkIo: "860 Mbps",
    temperature: 39,
    uptime: "130d 1h",
    alertCount: 4,
    powerState: "On",
    healthStatus: "Critical",
  },
  {
    id: "device-fw-edge-01",
    name: "FW-EDGE-01",
    kind: "device",
    parentId: "net-rack-03",
    rackId: "net-rack-03",
    rackUnitStart: 39,
    rackUnitSize: 2,
    deviceType: "Firewall",
    ipAddress: "10.77.3.254",
    osPlatform: "Firewall OS",
    cpuUsage: 79,
    memoryUsage: 84,
    networkIo: "690 Mbps",
    temperature: 42,
    uptime: "8d 19h",
    alertCount: 5,
    powerState: "On",
    healthStatus: "Critical",
  },
];

const siteMetrics: Record<string, { occupancy: number; avgTemp: number; powerUtilization: number; activeAlerts: number }> = {
  "site-mumbai-dc1": { occupancy: 78, avgTemp: 31, powerUtilization: 66, activeAlerts: 4 },
  "site-frankfurt-dc1": { occupancy: 64, avgTemp: 28, powerUtilization: 54, activeAlerts: 2 },
  "site-virginia-dc3": { occupancy: 85, avgTemp: 36, powerUtilization: 79, activeAlerts: 7 },
};

const rackMetrics: Record<string, { powerLoadKw: number; temperatureState: string; recentAlerts: string[] }> = {
  "rack-a-01": {
    powerLoadKw: 7.4,
    temperatureState: "Slightly Elevated",
    recentAlerts: ["RAID rebuild running", "Memory pressure above threshold"],
  },
  "rack-b-07": {
    powerLoadKw: 5.9,
    temperatureState: "Stable",
    recentAlerts: ["Backup job completed"],
  },
  "net-rack-03": {
    powerLoadKw: 8.1,
    temperatureState: "Hot Zone",
    recentAlerts: ["Interface flaps detected", "Firewall CPU sustained >75%"],
  },
};

const recentIssues = [
  { id: "iss-1", entityId: "site-virginia-dc3", severity: "Critical", text: "Cooling loop imbalance in Room B", time: "6m ago" },
  { id: "iss-2", entityId: "rack-a-01", severity: "Warning", text: "High memory utilization on SRV-DB-01", time: "18m ago" },
  { id: "iss-3", entityId: "device-fw-edge-01", severity: "Critical", text: "Firewall throughput saturation", time: "2m ago" },
  { id: "iss-4", entityId: "region-ap-south", severity: "Warning", text: "Patch backlog increasing in AP-South", time: "39m ago" },
];

const allEntities: RackVisionEntity[] = [...regions, ...sites, ...rooms, ...rows, ...racks, ...devices];

function aggregateHealth(entities: RackVisionEntity[]) {
  return entities.reduce(
    (acc, entity) => {
      acc.total += 1;
      if (entity.healthStatus === "Healthy") acc.healthy += 1;
      if (entity.healthStatus === "Warning") acc.warning += 1;
      if (entity.healthStatus === "Critical") acc.critical += 1;
      if (entity.healthStatus === "Offline") acc.offline += 1;
      if (entity.healthStatus === "Maintenance") acc.maintenance += 1;
      return acc;
    },
    { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0, maintenance: 0 },
  );
}

function childrenOf(entityId: string) {
  return allEntities.filter((entity) => entity.parentId === entityId);
}

function parentOf(entityId: string) {
  const target = allEntities.find((entity) => entity.id === entityId);
  if (!target?.parentId) return undefined;
  return allEntities.find((entity) => entity.id === target.parentId);
}

function descendantsOf(entityId: string) {
  const target = allEntities.find((entity) => entity.id === entityId);
  if (!target) return [] as RackVisionEntity[];

  const descendants: RackVisionEntity[] = [];
  const stack: RackVisionEntity[] = [target];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    descendants.push(current);
    stack.push(...childrenOf(current.id));
  }

  return descendants;
}

function countByKind(entityId: string, kind: RackVisionEntityKind) {
  return descendantsOf(entityId).filter((entity) => entity.kind === kind).length;
}

function buildTree(parentId: string | null = null): HierarchyNode[] {
  const roots = allEntities.filter((entity) => entity.parentId === parentId);
  return roots.map((entity) => ({ entity, children: buildTree(entity.id) }));
}

function searchEntity(entity: RackVisionEntity, query: string) {
  const baseText = `${entity.name} ${entity.kind}`.toLowerCase();
  if (entity.kind === "device") {
    return `${baseText} ${entity.ipAddress} ${entity.deviceType}`.includes(query);
  }
  if (entity.kind === "rack") {
    return `${baseText} ${entity.occupancyPercent}`.includes(query);
  }
  return baseText.includes(query);
}

function collectAncestorIds(entityId: string) {
  const ancestorIds: string[] = [];
  let current = parentOf(entityId);
  while (current) {
    ancestorIds.push(current.id);
    current = current.parentId ? allEntities.find((entity) => entity.id === current?.parentId) : undefined;
  }
  return ancestorIds;
}

function resolveHealthFromChildren(entityId: string): HealthStatus {
  const children = childrenOf(entityId);
  if (!children.length) return "Healthy";
  if (children.some((child) => child.healthStatus === "Critical")) return "Critical";
  if (children.some((child) => child.healthStatus === "Warning")) return "Warning";
  if (children.some((child) => child.healthStatus === "Offline")) return "Offline";
  if (children.some((child) => child.healthStatus === "Maintenance")) return "Maintenance";
  return "Healthy";
}

export const MockDataService = {
  async getRegions() {
    await wait();
    return regions;
  },

  async getSitesByRegion(regionId: string) {
    await wait();
    return sites.filter((site) => site.regionId === regionId);
  },

  async getRoomsBySite(siteId: string) {
    await wait();
    return rooms.filter((room) => room.siteId === siteId);
  },

  async getRowsByRoom(roomId: string) {
    await wait();
    return rows.filter((row) => row.roomId === roomId);
  },

  async getRacksByRow(rowId: string) {
    await wait();
    return racks.filter((rack) => rack.rowId === rowId);
  },

  async getHierarchyTree() {
    await wait();
    return buildTree();
  },

  async getChildren(entityId: string) {
    await wait();
    return childrenOf(entityId);
  },

  async getDevicesByRack(rackId: string) {
    await wait();
    return devices.filter((device) => device.rackId === rackId);
  },

  async getAllEntities() {
    await wait();
    return allEntities;
  },

  async getEntityById(id: string) {
    await wait();
    return allEntities.find((entity) => entity.id === id);
  },

  async getBreadcrumbs(entityId: string) {
    await wait();
    const breadcrumbs: BreadcrumbItem[] = [{ id: "global", label: "Global", kind: "global" }];
    let current = allEntities.find((entity) => entity.id === entityId);
    const chain: RackVisionEntity[] = [];

    while (current) {
      chain.push(current);
      current = current.parentId ? allEntities.find((entity) => entity.id === current?.parentId) : undefined;
    }

    chain
      .reverse()
      .forEach((entity) => breadcrumbs.push({ id: entity.id, label: entity.name, kind: entity.kind }));

    return breadcrumbs;
  },

  async getAggregatedHealth(entityId: string) {
    await wait();
    const target = allEntities.find((entity) => entity.id === entityId);
    if (!target) return { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0, maintenance: 0, rollupStatus: "Healthy" as HealthStatus };

    const descendants = descendantsOf(entityId);
    return { ...aggregateHealth(descendants), rollupStatus: resolveHealthFromChildren(entityId) };
  },

  async searchHierarchy(query: string) {
    await wait(180);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return { matchedIds: [] as string[], expandedIds: [] as string[] };

    const matchedIds = allEntities.filter((entity) => searchEntity(entity, normalized)).map((entity) => entity.id);
    const expandedIds = Array.from(new Set(matchedIds.flatMap((id) => collectAncestorIds(id))));
    return { matchedIds, expandedIds };
  },

  async getEntitySummary(entityId: string) {
    await wait();
    const entity = allEntities.find((item) => item.id === entityId);
    if (!entity) return null;

    const health = await this.getAggregatedHealth(entityId);
    const counts = {
      sites: countByKind(entityId, "site"),
      rooms: countByKind(entityId, "room"),
      rows: countByKind(entityId, "row"),
      racks: countByKind(entityId, "rack"),
      devices: countByKind(entityId, "device"),
    };

    const site = entity.kind === "site" ? entity : entity.kind !== "region" ? allEntities.find((x) => x.id === collectAncestorIds(entity.id).find((id) => allEntities.find((e) => e.id === id)?.kind === "site")) : undefined;
    const selectedSiteMetrics = site ? siteMetrics[site.id] : undefined;
    const selectedRackMetrics = entity.kind === "rack" ? rackMetrics[entity.id] : undefined;
    const issueItems = recentIssues.filter((issue) => issue.entityId === entity.id || collectAncestorIds(issue.entityId).includes(entity.id)).slice(0, 4);

    return {
      entity,
      health,
      counts,
      siteMetrics: selectedSiteMetrics,
      rackMetrics: selectedRackMetrics,
      issues: issueItems,
      availableUnits: entity.kind === "rack" ? Math.round(entity.totalUnits * (1 - entity.occupancyPercent / 100)) : undefined,
      usedUnits: entity.kind === "rack" ? Math.round(entity.totalUnits * (entity.occupancyPercent / 100)) : undefined,
      parent: entity.parentId ? allEntities.find((item) => item.id === entity.parentId) : undefined,
      children: childrenOf(entity.id),
    };
  },

  async getRecentIssues(entityId: string) {
    await wait();
    return recentIssues.filter((issue) => issue.entityId === entityId || collectAncestorIds(issue.entityId).includes(entityId));
  },
};
