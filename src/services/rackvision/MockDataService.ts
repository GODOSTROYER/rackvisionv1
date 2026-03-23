import {
  BreadcrumbItem,
  Device,
  GlobalSummary,
  GlobeMarker,
  HealthStatus,
  HierarchyNode,
  Rack,
  RackFilters,
  RackDeviceFilter,
  RackDeviceViewModel,
  RackSortOption,
  RackSummary,
  RackViewModel,
  RackVisionEntity,
  RackVisionEntityKind,
  Region,
  RegionSummary,
  RoomSummary,
  Room,
  RowSummary,
  Row,
  SiteCardSummary,
  SiteOverview,
  Site,
  SiteSummary,
} from "@/components/rackvision/types";

const DELAY_MS = 300;
const wait = async (ms = DELAY_MS) => new Promise((resolve) => window.setTimeout(resolve, ms));

const regions: Region[] = [
  {
    id: "region-ap-south",
    name: "AP-South",
    code: "AP",
    kind: "region",
    parentId: null,
    healthStatus: "Warning",
    latitude: 20.5937,
    longitude: 78.9629,
  },
  {
    id: "region-us-east",
    name: "US-East",
    code: "US",
    kind: "region",
    parentId: null,
    healthStatus: "Healthy",
    latitude: 37.0902,
    longitude: -78.0,
  },
  {
    id: "region-eu-west",
    name: "EU-West",
    code: "EU",
    kind: "region",
    parentId: null,
    healthStatus: "Healthy",
    latitude: 51.1657,
    longitude: 10.4515,
  },
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
    latitude: 19.076,
    longitude: 72.8777,
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
    latitude: 50.1109,
    longitude: 8.6821,
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
    latitude: 39.0438,
    longitude: -77.4874,
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
  {
    id: "device-rack-a-pdu",
    name: "PDU-A-01",
    kind: "device",
    parentId: "rack-a-01",
    rackId: "rack-a-01",
    rackUnitStart: 1,
    rackUnitSize: 2,
    deviceType: "PDU",
    ipAddress: "10.12.1.240",
    osPlatform: "Embedded",
    cpuUsage: 9,
    memoryUsage: 14,
    networkIo: "12 Mbps",
    temperature: 27,
    uptime: "201d 3h",
    alertCount: 0,
    powerState: "On",
    healthStatus: "Healthy",
  },
  {
    id: "device-rack-a-blank-01",
    name: "BLANK-A-01",
    kind: "device",
    parentId: "rack-a-01",
    rackId: "rack-a-01",
    rackUnitStart: 31,
    rackUnitSize: 1,
    deviceType: "Blank-Panel",
    ipAddress: "0.0.0.0",
    osPlatform: "N/A",
    cpuUsage: 0,
    memoryUsage: 0,
    networkIo: "0 Mbps",
    temperature: 0,
    uptime: "N/A",
    alertCount: 0,
    powerState: "Off",
    healthStatus: "Healthy",
  },
  {
    id: "device-net-rack-pdu",
    name: "PDU-NET-01",
    kind: "device",
    parentId: "net-rack-03",
    rackId: "net-rack-03",
    rackUnitStart: 1,
    rackUnitSize: 2,
    deviceType: "PDU",
    ipAddress: "10.77.3.240",
    osPlatform: "Embedded",
    cpuUsage: 8,
    memoryUsage: 11,
    networkIo: "14 Mbps",
    temperature: 31,
    uptime: "180d 9h",
    alertCount: 0,
    powerState: "On",
    healthStatus: "Healthy",
  },
  {
    id: "device-net-rack-uplink",
    name: "SW-UPLINK-03",
    kind: "device",
    parentId: "net-rack-03",
    rackId: "net-rack-03",
    rackUnitStart: 37,
    rackUnitSize: 1,
    deviceType: "Switch-ToR",
    ipAddress: "10.77.3.3",
    osPlatform: "Network OS",
    cpuUsage: 35,
    memoryUsage: 48,
    networkIo: "780 Mbps",
    temperature: 40,
    uptime: "67d 16h",
    alertCount: 1,
    powerState: "On",
    healthStatus: "Warning",
  },
];

const siteMetrics: Record<string, { occupancy: number; avgTemp: number; powerUtilization: number; activeAlerts: number }> = {
  "site-mumbai-dc1": { occupancy: 78, avgTemp: 31, powerUtilization: 66, activeAlerts: 4 },
  "site-frankfurt-dc1": { occupancy: 64, avgTemp: 28, powerUtilization: 54, activeAlerts: 2 },
  "site-virginia-dc3": { occupancy: 85, avgTemp: 36, powerUtilization: 79, activeAlerts: 7 },
};

const siteMeta: Record<string, { facilityType: string; powerCapacity: string; coolingStatus: string; lastSync: string; networkStatus: string; availability: string }> = {
  "site-mumbai-dc1": {
    facilityType: "Tier III Colocation",
    powerCapacity: "2.8 MW",
    coolingStatus: "Stable",
    lastSync: "2 min ago",
    networkStatus: "Nominal",
    availability: "99.96%",
  },
  "site-frankfurt-dc1": {
    facilityType: "Enterprise Data Center",
    powerCapacity: "2.2 MW",
    coolingStatus: "Optimal",
    lastSync: "3 min ago",
    networkStatus: "Nominal",
    availability: "99.99%",
  },
  "site-virginia-dc3": {
    facilityType: "Hyperscale Edge Facility",
    powerCapacity: "3.4 MW",
    coolingStatus: "Needs Attention",
    lastSync: "1 min ago",
    networkStatus: "Degraded",
    availability: "99.81%",
  },
};

const rackMetrics: Record<string, { powerLoadKw: number; temperatureState: string; recentAlerts: string[] }> = {
  "rack-a-01": { powerLoadKw: 7.4, temperatureState: "Slightly Elevated", recentAlerts: ["RAID rebuild running", "Memory pressure above threshold"] },
  "rack-b-07": { powerLoadKw: 5.9, temperatureState: "Stable", recentAlerts: ["Backup job completed"] },
  "net-rack-03": { powerLoadKw: 8.1, temperatureState: "Hot Zone", recentAlerts: ["Interface flaps detected", "Firewall CPU sustained >75%"] },
};

const recentIssues = [
  { id: "iss-1", entityId: "site-virginia-dc3", severity: "Critical", text: "Cooling loop imbalance in Room B", time: "6m ago" },
  { id: "iss-2", entityId: "rack-a-01", severity: "Warning", text: "High memory utilization on SRV-DB-01", time: "18m ago" },
  { id: "iss-3", entityId: "device-fw-edge-01", severity: "Critical", text: "Firewall throughput saturation", time: "2m ago" },
  { id: "iss-4", entityId: "region-ap-south", severity: "Warning", text: "Patch backlog increasing in AP-South", time: "39m ago" },
];

const allEntities: RackVisionEntity[] = [...regions, ...sites, ...rooms, ...rows, ...racks, ...devices];

const healthPriority: Record<HealthStatus, number> = { Healthy: 1, Warning: 2, Offline: 3, Maintenance: 4, Critical: 5 };

function childrenOf(entityId: string) {
  return allEntities.filter((entity) => entity.parentId === entityId);
}

function parentOf(entityId: string) {
  const entity = allEntities.find((item) => item.id === entityId);
  return entity?.parentId ? allEntities.find((item) => item.id === entity.parentId) : undefined;
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

function resolveHealthFromChildren(entityId: string): HealthStatus {
  const children = childrenOf(entityId);
  if (!children.length) return "Healthy";
  return children.reduce((worst, child) => (healthPriority[child.healthStatus] > healthPriority[worst] ? child.healthStatus : worst), "Healthy" as HealthStatus);
}

function collectAncestorIds(entityId: string) {
  const ids: string[] = [];
  let current = parentOf(entityId);
  while (current) {
    ids.push(current.id);
    current = current.parentId ? allEntities.find((item) => item.id === current?.parentId) : undefined;
  }
  return ids;
}

function buildTree(parentId: string | null = null): HierarchyNode[] {
  return allEntities.filter((entity) => entity.parentId === parentId).map((entity) => ({ entity, children: buildTree(entity.id) }));
}

function searchEntity(entity: RackVisionEntity, query: string) {
  const base = `${entity.name} ${entity.kind}`.toLowerCase();
  if (entity.kind === "device") return `${base} ${entity.ipAddress} ${entity.deviceType}`.includes(query);
  if (entity.kind === "rack") return `${base} ${entity.occupancyPercent}`.includes(query);
  if (entity.kind === "site") return `${base} ${entity.city} ${entity.country}`.includes(query);
  return base.includes(query);
}

function getRegionById(regionId: string) {
  return regions.find((region) => region.id === regionId);
}

function getRegionForEntity(entity: RackVisionEntity) {
  if (entity.kind === "region") return entity;
  const regionId = [entity.id, ...collectAncestorIds(entity.id)]
    .map((id) => allEntities.find((candidate) => candidate.id === id))
    .find((candidate) => candidate?.kind === "region")?.id;
  return regionId ? getRegionById(regionId) : undefined;
}

function getGlobalSummarySync(): GlobalSummary {
  const criticalAlerts = devices.filter((device) => device.healthStatus === "Critical").reduce((acc, device) => acc + device.alertCount, 0);
  const offlineCount = devices.filter((device) => device.healthStatus === "Offline").length;
  return {
    totalRegions: regions.length,
    totalSites: sites.length,
    totalRacks: racks.length,
    totalDevices: devices.length,
    criticalAlerts,
    onlineCount: devices.length - offlineCount,
    offlineCount,
  };
}

function getRegionSummarySync(regionId: string): RegionSummary {
  const regionSites = sites.filter((site) => site.regionId === regionId);
  const regionSiteIds = regionSites.map((site) => site.id);
  const regionRooms = rooms.filter((room) => regionSiteIds.includes(room.siteId));
  const regionRows = rows.filter((row) => regionRooms.some((room) => room.id === row.roomId));
  const regionRacks = racks.filter((rack) => regionRows.some((row) => row.id === rack.rowId));
  const regionDevices = devices.filter((device) => regionRacks.some((rack) => rack.id === device.rackId));
  const avgUtilization = regionRacks.length ? Math.round(regionRacks.reduce((acc, rack) => acc + rack.occupancyPercent, 0) / regionRacks.length) : 0;
  const healthScore = Math.max(0, 100 - regionDevices.filter((device) => device.healthStatus !== "Healthy").length * 7);
  return {
    regionId,
    sitesInRegion: regionSites.length,
    totalRacks: regionRacks.length,
    totalDevices: regionDevices.length,
    activeAlerts: regionDevices.reduce((acc, device) => acc + device.alertCount, 0),
    avgUtilization,
    healthScore,
  };
}

function getSiteSummarySync(siteId: string): SiteSummary {
  const site = sites.find((item) => item.id === siteId);
  const siteRooms = rooms.filter((room) => room.siteId === siteId);
  const siteRows = rows.filter((row) => siteRooms.some((room) => room.id === row.roomId));
  const siteRacks = racks.filter((rack) => siteRows.some((row) => row.id === rack.rowId));
  const siteDevices = devices.filter((device) => siteRacks.some((rack) => rack.id === device.rackId));
  const metrics = siteMetrics[siteId];
  return {
    siteId,
    regionName: site ? getRegionById(site.regionId)?.name ?? "Unknown" : "Unknown",
    totalRacks: siteRacks.length,
    totalDevices: siteDevices.length,
    totalRooms: siteRooms.length,
    totalRows: siteRows.length,
    occupancyPercent: metrics?.occupancy ?? 0,
    activeAlerts: metrics?.activeAlerts ?? siteDevices.reduce((acc, device) => acc + device.alertCount, 0),
    avgTemp: metrics?.avgTemp ?? 0,
    powerUtilization: metrics?.powerUtilization ?? 0,
    healthScore: Math.max(0, 100 - siteDevices.filter((device) => device.healthStatus !== "Healthy").length * 8),
  };
}

function getSiteIdForEntity(entity: RackVisionEntity): string | null {
  if (entity.kind === "site") return entity.id;
  if (entity.kind === "room") return entity.siteId;
  if (entity.kind === "row") return rooms.find((room) => room.id === entity.roomId)?.siteId ?? null;
  if (entity.kind === "rack") {
    const row = rows.find((item) => item.id === entity.rowId);
    const room = row ? rooms.find((item) => item.id === row.roomId) : undefined;
    return room?.siteId ?? null;
  }
  if (entity.kind === "device") {
    const rack = racks.find((item) => item.id === entity.rackId);
    const row = rack ? rows.find((item) => item.id === rack.rowId) : undefined;
    const room = row ? rooms.find((item) => item.id === row.roomId) : undefined;
    return room?.siteId ?? null;
  }
  return null;
}

function getRoomSummarySync(roomId: string): RoomSummary | null {
  const room = rooms.find((item) => item.id === roomId);
  if (!room) return null;
  const roomRows = rows.filter((row) => row.roomId === room.id);
  const roomRacks = racks.filter((rack) => roomRows.some((row) => row.id === rack.rowId));
  const roomDevices = devices.filter((device) => roomRacks.some((rack) => rack.id === device.rackId));
  return {
    roomId: room.id,
    siteId: room.siteId,
    name: room.name,
    healthStatus: room.healthStatus,
    rowCount: roomRows.length,
    rackCount: roomRacks.length,
    deviceCount: roomDevices.length,
    alertCount: roomDevices.reduce((acc, device) => acc + device.alertCount, 0),
  };
}

function getRowSummarySync(rowId: string): RowSummary | null {
  const row = rows.find((item) => item.id === rowId);
  if (!row) return null;
  const rowRacks = racks.filter((rack) => rack.rowId === row.id);
  const rowDevices = devices.filter((device) => rowRacks.some((rack) => rack.id === device.rackId));
  const averageTemp = rowDevices.length ? Math.round(rowDevices.reduce((acc, device) => acc + device.temperature, 0) / rowDevices.length) : 0;
  const powerLoadKw = rowRacks.reduce((acc, rack) => acc + (rackMetrics[rack.id]?.powerLoadKw ?? 0), 0);
  const occupancyPercent = rowRacks.length ? Math.round(rowRacks.reduce((acc, rack) => acc + rack.occupancyPercent, 0) / rowRacks.length) : 0;
  return {
    rowId: row.id,
    roomId: row.roomId,
    name: row.name,
    healthStatus: row.healthStatus,
    racks: rowRacks.length,
    devices: rowDevices.length,
    occupancyPercent,
    activeAlerts: rowDevices.reduce((acc, device) => acc + device.alertCount, 0),
    avgTemperature: averageTemp,
    powerLoadKw: Number(powerLoadKw.toFixed(1)),
  };
}

function getRackSummarySync(rackId: string): RackSummary | null {
  const rack = racks.find((item) => item.id === rackId);
  if (!rack) return null;
  const row = rows.find((item) => item.id === rack.rowId);
  const room = row ? rooms.find((item) => item.id === row.roomId) : undefined;
  const site = room ? sites.find((item) => item.id === room.siteId) : undefined;
  const rackDevices = devices.filter((device) => device.rackId === rack.id);
  const usedUnits = Math.round((rack.totalUnits * rack.occupancyPercent) / 100);
  const avgTemperature = rackDevices.length ? Math.round(rackDevices.reduce((acc, device) => acc + device.temperature, 0) / rackDevices.length) : 0;

  return {
    rackId: rack.id,
    name: rack.name,
    siteId: site?.id ?? "",
    roomId: room?.id ?? "",
    rowId: row?.id ?? "",
    roomName: room?.name ?? "Unknown Room",
    rowName: row?.name ?? "Unknown Row",
    healthStatus: rack.healthStatus,
    occupancyPercent: rack.occupancyPercent,
    totalUnits: rack.totalUnits,
    usedUnits,
    availableUnits: rack.totalUnits - usedUnits,
    deviceCount: rackDevices.length,
    alertCount: rackDevices.reduce((acc, device) => acc + device.alertCount, 0),
    powerLoadKw: rackMetrics[rack.id]?.powerLoadKw ?? 0,
    avgTemperature,
  };
}

function getSiteOverviewSync(siteId: string): SiteOverview | null {
  const site = sites.find((item) => item.id === siteId);
  if (!site) return null;
  const regionName = getRegionById(site.regionId)?.name ?? "Unknown Region";
  const summary = getSiteSummarySync(siteId);
  const roomSummaries = rooms
    .filter((room) => room.siteId === siteId)
    .map((room) => getRoomSummarySync(room.id))
    .filter((room): room is RoomSummary => Boolean(room));
  return {
    site,
    regionName,
    summary,
    metadata: siteMeta[siteId] ?? {
      facilityType: "Enterprise Facility",
      powerCapacity: "1.8 MW",
      coolingStatus: "Stable",
      lastSync: "5 min ago",
      networkStatus: "Nominal",
      availability: "99.9%",
    },
    rooms: roomSummaries,
  };
}

function getRegionSitesSync(regionId: string): SiteCardSummary[] {
  return sites
    .filter((site) => site.regionId === regionId)
    .map((site) => {
      const summary = getSiteSummarySync(site.id);
      return {
        siteId: site.id,
        name: site.name,
        city: site.city,
        country: site.country,
        healthStatus: site.healthStatus,
        racks: summary.totalRacks,
        devices: summary.totalDevices,
        alerts: summary.activeAlerts,
        occupancyPercent: summary.occupancyPercent,
      };
    });
}

function applyRackFilters(rackList: RackSummary[], filters: RackFilters) {
  return rackList.filter((rack) => {
    if (filters.status !== "all" && rack.healthStatus !== filters.status) return false;
    if (filters.roomId !== "all" && rack.roomId !== filters.roomId) return false;
    if (filters.rowId !== "all" && rack.rowId !== filters.rowId) return false;
    if (filters.occupancy === "low" && rack.occupancyPercent >= 50) return false;
    if (filters.occupancy === "medium" && (rack.occupancyPercent < 50 || rack.occupancyPercent > 79)) return false;
    if (filters.occupancy === "high" && rack.occupancyPercent < 80) return false;
    if (filters.alertLevel === "warning_critical" && rack.alertCount === 0) return false;
    if (filters.alertLevel === "critical_only" && rack.healthStatus !== "Critical") return false;
    return true;
  });
}

function applyRackSort(rackList: RackSummary[], sortBy: RackSortOption) {
  const list = [...rackList];
  if (sortBy === "rack_id") return list.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "occupancy") return list.sort((a, b) => b.occupancyPercent - a.occupancyPercent);
  if (sortBy === "alerts") return list.sort((a, b) => b.alertCount - a.alertCount);
  if (sortBy === "temperature") return list.sort((a, b) => b.avgTemperature - a.avgTemperature);
  if (sortBy === "power") return list.sort((a, b) => b.powerLoadKw - a.powerLoadKw);
  return list.sort((a, b) => healthPriority[b.healthStatus] - healthPriority[a.healthStatus]);
}

function getRackDevicesSync(rackId: string) {
  return devices
    .filter((device) => device.rackId === rackId)
    .sort((a, b) => b.rackUnitStart - a.rackUnitStart);
}

function getAdjacentRacksSync(rackId: string) {
  const rack = racks.find((item) => item.id === rackId);
  if (!rack) return { previousRackId: null as string | null, nextRackId: null as string | null };
  const ordered = racks
    .filter((item) => item.rowId === rack.rowId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const idx = ordered.findIndex((item) => item.id === rackId);
  return {
    previousRackId: idx > 0 ? ordered[idx - 1].id : null,
    nextRackId: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].id : null,
  };
}

function mapDeviceToGrid(device: Device): RackDeviceViewModel {
  const gridRowStart = 43 - (device.rackUnitStart + device.rackUnitSize - 1);
  return {
    device,
    gridRowStart,
    gridRowSpan: device.rackUnitSize,
  };
}

function getRackOccupancySync(rackId: string) {
  const rack = getRackSummarySync(rackId);
  if (!rack) return { occupancyPercent: 0, usedUnits: 0, availableUnits: 42 };
  return {
    occupancyPercent: rack.occupancyPercent,
    usedUnits: rack.usedUnits,
    availableUnits: rack.availableUnits,
  };
}

function getAvailableRackUnitsSync(rackId: string) {
  const occupied = new Set<number>();
  getRackDevicesSync(rackId).forEach((device) => {
    for (let unit = device.rackUnitStart; unit < device.rackUnitStart + device.rackUnitSize; unit += 1) {
      occupied.add(unit);
    }
  });
  return Array.from({ length: 42 }, (_, index) => index + 1).filter((unit) => !occupied.has(unit));
}

function applyDeviceFilters(list: Device[], filters: RackDeviceFilter, query: string, highlightCriticalOnly: boolean) {
  const normalized = query.trim().toLowerCase();
  return list.filter((device) => {
    if (filters.type !== "all" && device.deviceType !== filters.type) return false;
    if (filters.status !== "all" && device.healthStatus !== filters.status) return false;
    if (highlightCriticalOnly && device.healthStatus !== "Critical") return false;
    if (!normalized) return true;
    return `${device.name} ${device.ipAddress} ${device.deviceType}`.toLowerCase().includes(normalized);
  });
}

function getRackViewModelSync(rackId: string, filters?: RackDeviceFilter, query = "", highlightCriticalOnly = false): RackViewModel | null {
  const rack = getRackSummarySync(rackId);
  if (!rack) return null;
  const filteredDevices = applyDeviceFilters(
    getRackDevicesSync(rackId),
    filters ?? { type: "all", status: "all" },
    query,
    highlightCriticalOnly,
  );
  const devicesView = filteredDevices.map(mapDeviceToGrid);
  const occupied = new Set<number>();
  filteredDevices.forEach((device) => {
    for (let unit = device.rackUnitStart; unit < device.rackUnitStart + device.rackUnitSize; unit += 1) {
      occupied.add(unit);
    }
  });
  const emptyUnits = Array.from({ length: 42 }, (_, index) => index + 1).filter((unit) => !occupied.has(unit));
  const adjacent = getAdjacentRacksSync(rackId);
  return {
    rack,
    devices: devicesView,
    emptyUnits,
    occupancyPercent: rack.occupancyPercent,
    usedUnits: rack.usedUnits,
    availableUnits: rack.availableUnits,
    previousRackId: adjacent.previousRackId,
    nextRackId: adjacent.nextRackId,
  };
}

function buildRegionMarker(region: Region): GlobeMarker {
  const summary = getRegionSummarySync(region.id);
  const descendants = descendantsOf(region.id);
  const health = aggregateHealth(descendants);
  return {
    id: region.id,
    kind: "region",
    name: region.name,
    latitude: region.latitude,
    longitude: region.longitude,
    healthStatus: region.healthStatus,
    metrics: {
      sites: summary.sitesInRegion,
      racks: summary.totalRacks,
      devices: summary.totalDevices,
      warning: health.warning,
      critical: health.critical,
      activeAlerts: summary.activeAlerts,
    },
  };
}

function buildSiteMarker(site: Site): GlobeMarker {
  const summary = getSiteSummarySync(site.id);
  const descendants = descendantsOf(site.id);
  const health = aggregateHealth(descendants);
  return {
    id: site.id,
    kind: "site",
    name: site.name,
    latitude: site.latitude,
    longitude: site.longitude,
    regionId: site.regionId,
    healthStatus: site.healthStatus,
    metrics: {
      racks: summary.totalRacks,
      devices: summary.totalDevices,
      warning: health.warning,
      critical: health.critical,
      activeAlerts: summary.activeAlerts,
      occupancyPercent: summary.occupancyPercent,
    },
  };
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
  async getDevicesByRack(rackId: string) {
    await wait();
    return getRackDevicesSync(rackId);
  },
  async getHierarchyTree() {
    await wait();
    return buildTree();
  },
  async getChildren(entityId: string) {
    await wait();
    return childrenOf(entityId);
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
    chain.reverse().forEach((entity) => breadcrumbs.push({ id: entity.id, label: entity.name, kind: entity.kind }));
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
    const site = entity.kind === "site" ? entity : getRegionForEntity(entity)?.id ? sites.find((item) => item.id === collectAncestorIds(entity.id).find((id) => sites.some((s) => s.id === id))) : undefined;
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
  async getGlobalInfrastructureSummary() {
    await wait();
    return getGlobalSummarySync();
  },
  async getRegionsWithMetrics() {
    await wait();
    return regions.map((region) => ({
      ...region,
      summary: getRegionSummarySync(region.id),
      health: aggregateHealth(descendantsOf(region.id)),
    }));
  },
  async getSitesWithCoordinates(regionId?: string) {
    await wait();
    return (regionId ? sites.filter((site) => site.regionId === regionId) : sites).map((site) => ({
      ...site,
      summary: getSiteSummarySync(site.id),
    }));
  },
  async getRegionSummary(regionId: string) {
    await wait();
    return getRegionSummarySync(regionId);
  },
  async getSiteSummary(siteId: string) {
    await wait();
    return getSiteSummarySync(siteId);
  },
  async getRegionSites(regionId: string) {
    await wait();
    return getRegionSitesSync(regionId);
  },
  async getSiteOverview(siteId: string) {
    await wait();
    return getSiteOverviewSync(siteId);
  },
  async getSiteRooms(siteId: string) {
    await wait();
    return rooms
      .filter((room) => room.siteId === siteId)
      .map((room) => getRoomSummarySync(room.id))
      .filter((room): room is RoomSummary => Boolean(room));
  },
  async getRoomRows(roomId: string) {
    await wait();
    return rows
      .filter((row) => row.roomId === roomId)
      .map((row) => getRowSummarySync(row.id))
      .filter((row): row is RowSummary => Boolean(row));
  },
  async getRowRacks(rowId: string) {
    await wait();
    return racks
      .filter((rack) => rack.rowId === rowId)
      .map((rack) => getRackSummarySync(rack.id))
      .filter((rack): rack is RackSummary => Boolean(rack));
  },
  async getRackSummary(rackId: string) {
    await wait();
    const summary = getRackSummarySync(rackId);
    if (!summary) return null;
    const rackDevices = devices.filter((device) => device.rackId === rackId);
    return {
      ...summary,
      devices: rackDevices,
      siteName: sites.find((site) => site.id === summary.siteId)?.name ?? "Unknown Site",
    };
  },
  async getRackViewModel(rackId: string, filters?: RackDeviceFilter, query = "", highlightCriticalOnly = false) {
    await wait();
    return getRackViewModelSync(rackId, filters, query, highlightCriticalOnly);
  },
  async getRackDevices(rackId: string) {
    await wait();
    return getRackDevicesSync(rackId);
  },
  async getDeviceById(deviceId: string) {
    await wait();
    return devices.find((device) => device.id === deviceId) ?? null;
  },
  async getRackOccupancy(rackId: string) {
    await wait();
    return getRackOccupancySync(rackId);
  },
  async getAvailableRackUnits(rackId: string) {
    await wait();
    return getAvailableRackUnitsSync(rackId);
  },
  async getAdjacentRacks(rackId: string) {
    await wait();
    return getAdjacentRacksSync(rackId);
  },
  async filterRackDevices(rackId: string, filters: RackDeviceFilter, query = "", highlightCriticalOnly = false) {
    await wait(150);
    return applyDeviceFilters(getRackDevicesSync(rackId), filters, query, highlightCriticalOnly);
  },
  async searchRackDevices(rackId: string, query: string) {
    await wait(120);
    return applyDeviceFilters(getRackDevicesSync(rackId), { type: "all", status: "all" }, query, false);
  },
  async searchInfrastructure(query: string) {
    await wait(180);
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allEntities;
    return allEntities.filter((entity) => searchEntity(entity, normalized));
  },
  async filterRacks(siteId: string, filters: RackFilters, searchQuery: string) {
    await wait(180);
    const siteRacks = racks
      .map((rack) => getRackSummarySync(rack.id))
      .filter((rack): rack is RackSummary => Boolean(rack))
      .filter((rack) => rack.siteId === siteId);
    const searched = searchQuery.trim()
      ? siteRacks.filter((rack) => {
          const room = rooms.find((item) => item.id === rack.roomId);
          const row = rows.find((item) => item.id === rack.rowId);
          const text = `${rack.name} ${room?.name ?? ""} ${row?.name ?? ""}`.toLowerCase();
          return text.includes(searchQuery.trim().toLowerCase());
        })
      : siteRacks;
    return applyRackFilters(searched, filters);
  },
  async sortRacks(rackList: RackSummary[], sortBy: RackSortOption) {
    await wait(120);
    return applyRackSort(rackList, sortBy);
  },
  async getRowsForSite(siteId: string) {
    await wait();
    const siteRooms = rooms.filter((room) => room.siteId === siteId).map((room) => room.id);
    return rows
      .filter((row) => siteRooms.includes(row.roomId))
      .map((row) => getRowSummarySync(row.id))
      .filter((row): row is RowSummary => Boolean(row));
  },
  async getRacksForSite(siteId: string, filters?: RackFilters, sortBy?: RackSortOption, searchQuery = "") {
    await wait();
    const filtered = await this.filterRacks(
      siteId,
      filters ?? { status: "all", roomId: "all", rowId: "all", occupancy: "all", alertLevel: "all" },
      searchQuery,
    );
    return applyRackSort(filtered, sortBy ?? "rack_id");
  },
  getSiteIdForEntity(entityId: string) {
    const entity = allEntities.find((item) => item.id === entityId);
    if (!entity) return null;
    return getSiteIdForEntity(entity);
  },
  async getMarkerData(regionId?: string) {
    await wait();
    const regionMarkers = regions.map(buildRegionMarker);
    const siteMarkers = (regionId ? sites.filter((site) => site.regionId === regionId) : sites).map(buildSiteMarker);
    return { regionMarkers, siteMarkers };
  },
};
