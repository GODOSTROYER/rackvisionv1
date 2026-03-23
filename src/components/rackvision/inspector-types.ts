import { RackVisionEntity } from "@/components/rackvision/types";

export type InspectorSummary = {
  entity: RackVisionEntity;
  health: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
    maintenance: number;
    rollupStatus: string;
  };
  counts: {
    sites: number;
    rooms: number;
    rows: number;
    racks: number;
    devices: number;
  };
  siteMetrics?: { occupancy: number; avgTemp: number; powerUtilization: number; activeAlerts: number };
  rackMetrics?: { powerLoadKw: number; temperatureState: string; recentAlerts: string[] };
  issues: { id: string; severity: string; text: string; time: string; entityId: string }[];
  availableUnits?: number;
  usedUnits?: number;
  parent?: RackVisionEntity;
  children: RackVisionEntity[];
};
