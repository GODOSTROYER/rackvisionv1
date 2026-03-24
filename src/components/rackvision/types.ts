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
export type GlobeRendererMode = "three" | "mapbox";
export type LayoutOverlayMode = "alerts" | "occupancy" | "thermal" | "power";
export type RackVisionFilterPresetId = "custom" | "critical-sites" | "high-temp-racks" | "offline-devices";

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
  countryCode: string;
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
  activeView: RackVisionViewMode;
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
  globeRenderer: GlobeRendererMode;
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
  breadcrumbs: BreadcrumbItem[];
  globalSearchQuery: string;
  globalSearchResults: RackVisionSearchResult[];
  isSearchResultsOpen: boolean;
  activeFilters: RackVisionActiveFilters;
  activeFilterPresetId: RackVisionFilterPresetId;
  layoutContext: {
    siteId: string | null;
    roomId: string | null;
  };
  layoutOverlayMode: LayoutOverlayMode;
  investigationHistory: InvestigationHistoryEntry[];
  isLoading: boolean;
};

export type RackVisionSearchResult = {
  id: string;
  name: string;
  kind: RackVisionEntityKind;
  subtitle: string;
  group: "Regions" | "Sites" | "Rooms" | "Rows" | "Racks" | "Devices";
};

export type RackVisionActiveFilters = {
  status: HealthStatus | "all";
  deviceType: DeviceType | "all";
  criticalOnly: boolean;
  offlineOnly: boolean;
  regionId: string | "all";
  siteId: string | "all";
  roomId: string | "all";
  rowId: string | "all";
  alertSeverity: "all" | "warning" | "critical";
  occupancyRange: "all" | "low" | "medium" | "high";
};

export type RackVisionFilterPreset = {
  id: RackVisionFilterPresetId;
  label: string;
  description: string;
  filters: RackVisionActiveFilters;
};

export type InvestigationHistoryEntry = {
  id: string;
  entityId: string | null;
  label: string;
  kind: RackVisionEntityKind | "global";
  route: string;
  view: RackVisionViewMode;
  timestamp: string;
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
  | { type: "SET_ACTIVE_VIEW"; payload: RackVisionViewMode }
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
  | { type: "SET_GLOBE_RENDERER"; payload: GlobeRendererMode }
  | { type: "SET_INSPECTOR_ENTITY"; payload: string | null }
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
  | { type: "SET_BREADCRUMBS"; payload: BreadcrumbItem[] }
  | { type: "SET_GLOBAL_SEARCH_QUERY"; payload: string }
  | { type: "SET_GLOBAL_SEARCH_RESULTS"; payload: RackVisionSearchResult[] }
  | { type: "OPEN_SEARCH_RESULTS" }
  | { type: "CLOSE_SEARCH_RESULTS" }
  | { type: "SET_ACTIVE_FILTERS"; payload: RackVisionActiveFilters }
  | { type: "CLEAR_ACTIVE_FILTERS" }
  | { type: "SET_FILTER_PRESET"; payload: RackVisionFilterPresetId }
  | { type: "SET_LAYOUT_CONTEXT"; payload: { siteId: string | null; roomId: string | null } }
  | { type: "SET_LAYOUT_OVERLAY_MODE"; payload: LayoutOverlayMode }
  | { type: "SET_INVESTIGATION_HISTORY"; payload: InvestigationHistoryEntry[] }
  | { type: "PUSH_INVESTIGATION_HISTORY"; payload: InvestigationHistoryEntry }
  | { type: "CLEAR_INVESTIGATION_HISTORY" }
  | { type: "SET_LOADING"; payload: boolean };

export type RackVisionSelectionContext = {
  entity: RackVisionEntity;
  breadcrumbs: BreadcrumbItem[];
  regionId: string | null;
  siteId: string | null;
  roomId: string | null;
  rowId: string | null;
  rackId: string | null;
  deviceId: string | null;
};

export const DEFAULT_ACTIVE_FILTERS: RackVisionActiveFilters = {
  status: "all",
  deviceType: "all",
  criticalOnly: false,
  offlineOnly: false,
  regionId: "all",
  siteId: "all",
  roomId: "all",
  rowId: "all",
  alertSeverity: "all",
  occupancyRange: "all",
};

export const RACKVISION_FILTER_PRESETS: RackVisionFilterPreset[] = [
  {
    id: "custom",
    label: "All Infrastructure",
    description: "Default scope across the full RackVision estate.",
    filters: DEFAULT_ACTIVE_FILTERS,
  },
  {
    id: "critical-sites",
    label: "Critical Sites",
    description: "Focus on critical entities and severe alert conditions.",
    filters: {
      ...DEFAULT_ACTIVE_FILTERS,
      status: "Critical",
      criticalOnly: true,
      alertSeverity: "critical",
    },
  },
  {
    id: "high-temp-racks",
    label: "High Temp Racks",
    description: "Prioritize dense racks with warning or critical conditions.",
    filters: {
      ...DEFAULT_ACTIVE_FILTERS,
      status: "Warning",
      occupancyRange: "high",
      alertSeverity: "warning",
    },
  },
  {
    id: "offline-devices",
    label: "Offline Devices",
    description: "Surface offline assets and incident follow-up work quickly.",
    filters: {
      ...DEFAULT_ACTIVE_FILTERS,
      status: "Offline",
      offlineOnly: true,
    },
  },
];

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
  country?: string;
  city?: string;
  metrics: {
    sites?: number;
    rooms?: number;
    rows?: number;
    racks: number;
    devices: number;
    warning: number;
    critical: number;
    activeAlerts: number;
    occupancyPercent?: number;
    avgTemp?: number;
    powerUtilization?: number;
  };
};

export type CountryInfrastructureSummary = {
  countryCode: string;
  countryName: string;
  sites: number;
  rooms: number;
  rows: number;
  racks: number;
  devices: number;
  warning: number;
  critical: number;
  activeAlerts: number;
  avgOccupancy: number;
  avgUtilization: number;
  healthStatus: HealthStatus;
  hasInfrastructure: boolean;
};

export type EntityHoverSummary = {
  id: string;
  kind: "country" | RackVisionEntityKind;
  title: string;
  subtitle?: string;
  healthStatus: HealthStatus;
  metrics: Array<{ label: string; value: string | number }>;
};

export type InspectorKind = Extract<RackVisionEntityKind, "region" | "site" | "room" | "row" | "rack" | "device">;

export type LayoutRackTileModel = {
  rackId: string;
  rackName: string;
  rowId: string;
  rowName: string;
  roomId: string;
  roomName: string;
  healthStatus: HealthStatus;
  occupancyPercent: number;
  alertCount: number;
  deviceCount: number;
  avgTemperature: number;
  powerDrawKw: number;
  hotspotRisk: "Low" | "Medium" | "High";
};

export type LayoutRowLaneModel = {
  rowId: string;
  rowName: string;
  roomId: string;
  healthStatus: HealthStatus;
  occupancyPercent: number;
  activeAlerts: number;
  avgTemperature: number;
  powerDrawKw: number;
  hotspotRisk: "Low" | "Medium" | "High";
  racks: LayoutRackTileModel[];
};

export type LayoutRoomPanelModel = {
  roomId: string;
  roomName: string;
  healthStatus: HealthStatus;
  rows: LayoutRowLaneModel[];
};

export type LayoutViewModel = {
  siteId: string;
  siteName: string;
  regionName: string;
  rooms: LayoutRoomPanelModel[];
};

export type SystemDetails = {
  systemId: string;
  hostname: string;
  deviceType: DeviceType;
  ipAddress: string;
  osPlatform: string;
  healthStatus: HealthStatus;
  rackId: string;
  rackName: string;
  rowId: string;
  rowName: string;
  roomId: string;
  roomName: string;
  siteId: string;
  siteName: string;
  cpuUsage: number;
  memoryUsage: number;
  networkIo: string;
  temperature: number;
  uptime: string;
  alerts: number;
};
