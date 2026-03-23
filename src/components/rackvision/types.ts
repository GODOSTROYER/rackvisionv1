export type HealthStatus = "Healthy" | "Warning" | "Critical" | "Offline" | "Maintenance";

export type DeviceType =
  | "Server-1U"
  | "Server-2U"
  | "Appliance-4U"
  | "Storage"
  | "Switch-ToR"
  | "Firewall"
  | "PDU"
  | "Blank-Panel";

export type RackVisionEntityKind = "global" | "region" | "site" | "room" | "row" | "rack" | "device";

export type RackVisionView = "global" | "hierarchy" | "site" | "rack";

export type RackVisionViewMode = RackVisionView | "layout" | "split";

export type BaseRackVisionEntity = {
  id: string;
  name: string;
  kind: RackVisionEntityKind;
  parentId: string | null;
  healthStatus: HealthStatus;
};

export type Region = BaseRackVisionEntity & {
  kind: "region";
  code: string;
  latitude: number;
  longitude: number;
};

export type Site = BaseRackVisionEntity & {
  kind: "site";
  regionId: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type Room = BaseRackVisionEntity & {
  kind: "room";
  siteId: string;
};

export type Row = BaseRackVisionEntity & {
  kind: "row";
  roomId: string;
};

export type Rack = BaseRackVisionEntity & {
  kind: "rack";
  rowId: string;
  totalUnits: 42;
  occupancyPercent: number;
};

export type Device = BaseRackVisionEntity & {
  kind: "device";
  rackId: string;
  rackUnitStart: number;
  rackUnitSize: number;
  deviceType: DeviceType;
  ipAddress: string;
  osPlatform: string;
  cpuUsage: number;
  memoryUsage: number;
  networkIo: string;
  temperature: number;
  uptime: string;
  alertCount: number;
  powerState: "On" | "Standby" | "Off";
};

export type RackVisionEntity = Region | Site | Room | Row | Rack | Device;

export type BreadcrumbItem = {
  id: string;
  label: string;
  kind: RackVisionEntityKind | "global";
};

export type RackVisionState = {
  activeView: RackVisionView;
  selectedEntityId: string | null;
  selectedEntityKind: RackVisionEntityKind | null;
  inspectorEntityId: string | null;
  selectedRoomId: string | null;
  selectedRowId: string | null;
  selectedRackId: string | null;
  selectedDeviceId: string | null;
  hoveredDeviceId: string | null;
  activeRackId: string | null;
  rackPreviewRackId: string | null;
  hoveredEntityId: string | null;
  selectedMarkerId: string | null;
  globalViewMode: "regions" | "sites";
  expandedNodeIds: string[];
  searchQuery: string;
  rackSearchQuery: string;
  rackDeviceSearchQuery: string;
  rackSortBy: RackSortOption;
  rackFilters: RackFilters;
  rackDeviceFilter: RackDeviceFilter;
  showEmptyUnits: boolean;
  highlightCriticalOnly: boolean;
  treeResults: string[];
  statusFilter: HealthStatus | "all";
  deviceTypeFilter: DeviceType | "all";
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
};

export type RackFilters = {
  status: HealthStatus | "all";
  roomId: string | "all";
  rowId: string | "all";
  occupancy: "all" | "low" | "medium" | "high";
  alertLevel: "all" | "warning_critical" | "critical_only";
};

export type RackSortOption = "rack_id" | "occupancy" | "alerts" | "health" | "temperature" | "power";

export type RackDeviceFilter = {
  type: DeviceType | "all";
  status: HealthStatus | "all";
};

export type RackVisionAction =
  | { type: "SET_ACTIVE_VIEW"; payload: RackVisionView }
  | { type: "SELECT_ENTITY"; payload: { id: string | null; kind: RackVisionEntityKind | null } }
  | { type: "SET_SELECTED_ENTITY"; payload: { id: string | null; kind: RackVisionEntityKind | null } }
  | { type: "SET_SELECTED_ROOM"; payload: string | null }
  | { type: "SET_SELECTED_ROW"; payload: string | null }
  | { type: "SET_SELECTED_RACK"; payload: string | null }
  | { type: "SET_ACTIVE_RACK"; payload: string | null }
  | { type: "SET_SELECTED_DEVICE"; payload: string | null }
  | { type: "SET_HOVERED_DEVICE"; payload: string | null }
  | { type: "OPEN_RACK_PREVIEW"; payload: string }
  | { type: "CLOSE_RACK_PREVIEW" }
  | { type: "SET_HOVERED_ENTITY"; payload: string | null }
  | { type: "SET_SELECTED_MARKER"; payload: string | null }
  | { type: "SET_GLOBAL_VIEW_MODE"; payload: "regions" | "sites" }
  | { type: "OPEN_INSPECTOR"; payload: string }
  | { type: "SET_INSPECTOR_ENTITY"; payload: string | null }
  | { type: "CLOSE_INSPECTOR" }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_TREE_SEARCH"; payload: string }
  | { type: "SET_RACK_SEARCH"; payload: string }
  | { type: "SET_RACK_DEVICE_SEARCH"; payload: string }
  | { type: "SET_RACK_FILTERS"; payload: RackFilters }
  | { type: "SET_RACK_DEVICE_FILTER"; payload: RackDeviceFilter }
  | { type: "SET_RACK_SORT"; payload: RackSortOption }
  | { type: "SET_SHOW_EMPTY_UNITS"; payload: boolean }
  | { type: "SET_HIGHLIGHT_CRITICAL_ONLY"; payload: boolean }
  | { type: "TOGGLE_NODE_EXPANDED"; payload: string }
  | { type: "SET_EXPANDED_NODES"; payload: string[] }
  | { type: "SET_TREE_RESULTS"; payload: string[] }
  | { type: "SET_STATUS_FILTER"; payload: HealthStatus | "all" }
  | { type: "SET_DEVICE_TYPE_FILTER"; payload: DeviceType | "all" }
  | { type: "SET_BREADCRUMBS"; payload: BreadcrumbItem[] }
  | { type: "SET_LOADING"; payload: boolean };

export type HierarchyNode = {
  entity: RackVisionEntity;
  children: HierarchyNode[];
};

export type GlobalSummary = {
  totalRegions: number;
  totalSites: number;
  totalRacks: number;
  totalDevices: number;
  criticalAlerts: number;
  onlineCount: number;
  offlineCount: number;
};

export type RegionSummary = {
  regionId: string;
  sitesInRegion: number;
  totalRacks: number;
  totalDevices: number;
  activeAlerts: number;
  avgUtilization: number;
  healthScore: number;
};

export type SiteSummary = {
  siteId: string;
  regionName: string;
  totalRacks: number;
  totalDevices: number;
  occupancyPercent: number;
  activeAlerts: number;
  avgTemp: number;
  totalRooms?: number;
  totalRows?: number;
  powerUtilization?: number;
  healthScore?: number;
};

export type SiteCardSummary = {
  siteId: string;
  name: string;
  city: string;
  country: string;
  healthStatus: HealthStatus;
  racks: number;
  devices: number;
  alerts: number;
  occupancyPercent: number;
};

export type RoomSummary = {
  roomId: string;
  siteId: string;
  name: string;
  healthStatus: HealthStatus;
  rowCount: number;
  rackCount: number;
  deviceCount: number;
  alertCount: number;
};

export type RowSummary = {
  rowId: string;
  roomId: string;
  name: string;
  healthStatus: HealthStatus;
  racks: number;
  devices: number;
  occupancyPercent: number;
  activeAlerts: number;
  avgTemperature: number;
  powerLoadKw: number;
};

export type RackSummary = {
  rackId: string;
  name: string;
  siteId: string;
  roomId: string;
  rowId: string;
  roomName: string;
  rowName: string;
  healthStatus: HealthStatus;
  occupancyPercent: number;
  totalUnits: number;
  usedUnits: number;
  availableUnits: number;
  deviceCount: number;
  alertCount: number;
  powerLoadKw: number;
  avgTemperature: number;
};

export type RackDeviceViewModel = {
  device: Device;
  gridRowStart: number;
  gridRowSpan: number;
};

export type RackViewModel = {
  rack: RackSummary;
  devices: RackDeviceViewModel[];
  emptyUnits: number[];
  occupancyPercent: number;
  usedUnits: number;
  availableUnits: number;
  previousRackId: string | null;
  nextRackId: string | null;
};

export type SiteOverview = {
  site: Site;
  regionName: string;
  summary: SiteSummary;
  metadata: {
    facilityType: string;
    powerCapacity: string;
    coolingStatus: string;
    lastSync: string;
    networkStatus: string;
    availability: string;
  };
  rooms: RoomSummary[];
};

export type GlobeMarkerKind = "region" | "site";

export type GlobeMarker = {
  id: string;
  kind: GlobeMarkerKind;
  name: string;
  latitude: number;
  longitude: number;
  healthStatus: HealthStatus;
  regionId?: string;
  metrics: {
    sites?: number;
    racks: number;
    devices: number;
    warning: number;
    critical: number;
    activeAlerts: number;
    occupancyPercent?: number;
  };
};

export type InspectorKind = Extract<RackVisionEntityKind, "region" | "site" | "room" | "row" | "rack" | "device">;
