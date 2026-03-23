export type HealthStatus = "Healthy" | "Warning" | "Critical" | "Offline" | "Maintenance";

export type DeviceType =
  | "Server-1U"
  | "Server-2U"
  | "Appliance-4U"
  | "Storage"
  | "Switch-ToR"
  | "Firewall";

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
};

export type Site = BaseRackVisionEntity & {
  kind: "site";
  regionId: string;
  city: string;
  country: string;
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
  cpuUsage: number;
  memoryUsage: number;
  networkIo: string;
  temperature: number;
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
  searchQuery: string;
  statusFilter: HealthStatus | "all";
  deviceTypeFilter: DeviceType | "all";
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
};

export type RackVisionAction =
  | { type: "SET_ACTIVE_VIEW"; payload: RackVisionView }
  | { type: "SELECT_ENTITY"; payload: { id: string | null; kind: RackVisionEntityKind | null } }
  | { type: "OPEN_INSPECTOR"; payload: string }
  | { type: "CLOSE_INSPECTOR" }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: HealthStatus | "all" }
  | { type: "SET_DEVICE_TYPE_FILTER"; payload: DeviceType | "all" }
  | { type: "SET_BREADCRUMBS"; payload: BreadcrumbItem[] }
  | { type: "SET_LOADING"; payload: boolean };

export type InspectorKind = Extract<RackVisionEntityKind, "region" | "site" | "room" | "row" | "rack" | "device">;
