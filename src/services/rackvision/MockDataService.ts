import {
  BreadcrumbItem,
  Device,
  HealthStatus,
  Rack,
  RackVisionEntity,
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
    cpuUsage: 57,
    memoryUsage: 62,
    networkIo: "220 Mbps",
    temperature: 33,
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
    cpuUsage: 41,
    memoryUsage: 54,
    networkIo: "180 Mbps",
    temperature: 30,
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
    cpuUsage: 69,
    memoryUsage: 72,
    networkIo: "320 Mbps",
    temperature: 36,
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
    cpuUsage: 48,
    memoryUsage: 81,
    networkIo: "410 Mbps",
    temperature: 34,
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
    cpuUsage: 23,
    memoryUsage: 37,
    networkIo: "860 Mbps",
    temperature: 39,
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
    cpuUsage: 79,
    memoryUsage: 84,
    networkIo: "690 Mbps",
    temperature: 42,
    powerState: "On",
    healthStatus: "Critical",
  },
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

  async getDevicesByRack(rackId: string) {
    await wait();
    return devices.filter((device) => device.rackId === rackId);
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
    if (!target) return { total: 0, healthy: 0, warning: 0, critical: 0, offline: 0, maintenance: 0 };

    const descendants: RackVisionEntity[] = [];
    const stack: RackVisionEntity[] = [target];

    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
      descendants.push(current);
      stack.push(...childrenOf(current.id));
    }

    return { ...aggregateHealth(descendants), rollupStatus: resolveHealthFromChildren(entityId) };
  },
};
