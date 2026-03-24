import type { EntityHoverSummary, GlobeMarker, HealthStatus } from "@/components/rackvision/types";

export type GlobePalette = {
  ocean: string;
  atmosphere: string;
  land: string;
  landHovered: string;
  landSelected: string;
  border: string;
  borderActive: string;
  healthy: string;
  warning: string;
  critical: string;
  offline: string;
  maintenance: string;
};

const countryAlias: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  india: "IN",
  germany: "DE",
};

export const defaultGlobePalette: GlobePalette = {
  ocean: "#3d6d9e",
  atmosphere: "#97d8fb",
  land: "rgba(109, 216, 232, 0.92)",
  landHovered: "rgba(120, 238, 247, 0.98)",
  landSelected: "rgba(255, 216, 112, 0.98)",
  border: "rgba(255, 255, 255, 0.52)",
  borderActive: "rgba(255, 234, 179, 0.98)",
  healthy: "#2fb55d",
  warning: "#d99210",
  critical: "#dc3c3c",
  offline: "#667085",
  maintenance: "#7a8797",
};

export function normalizeCssColor(input: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return fallback;
  }

  context.fillStyle = fallback;
  const fallbackColor = context.fillStyle;
  context.fillStyle = fallback;
  context.fillStyle = input;

  return context.fillStyle || fallbackColor || fallback;
}

export function buildThemePalette(): GlobePalette {
  function readVar(token: string, fallback: string): string {
    const root = window.getComputedStyle(document.documentElement);
    const value = root.getPropertyValue(token).trim();
    const normalizedColor = value ? `hsl(${value})` : fallback;

    return normalizeCssColor(normalizedColor, fallback);
  }

  return {
    ...defaultGlobePalette,
    ocean: readVar("--secondary", defaultGlobePalette.ocean),
    atmosphere: readVar("--accent", defaultGlobePalette.atmosphere),
    healthy: readVar("--healthy", defaultGlobePalette.healthy),
    warning: readVar("--warning", defaultGlobePalette.warning),
    critical: readVar("--critical", defaultGlobePalette.critical),
    offline: readVar("--offline", defaultGlobePalette.offline),
    maintenance: readVar("--muted-foreground", defaultGlobePalette.maintenance),
  };
}

export function normalizeCountryCode(name: string, rawCode: string | undefined): string {
  const code = rawCode?.trim().toUpperCase();

  if (code && code.length === 2 && code !== "-99") {
    return code;
  }

  return countryAlias[name.toLowerCase()] ?? name.slice(0, 2).toUpperCase();
}

export function getMarkerSubtitle(marker: GlobeMarker, regionLookup: Record<string, string>): string {
  if (marker.kind === "site") {
    return `${marker.city ?? "Unknown City"}, ${marker.country ?? "Unknown Country"}`;
  }

  if (marker.regionId) {
    return regionLookup[marker.regionId] ?? "Region";
  }

  return "Region";
}

export function markerToSummary(marker: GlobeMarker, regionLookup: Record<string, string>): EntityHoverSummary {
  return {
    id: marker.id,
    kind: marker.kind,
    title: marker.name,
    subtitle: getMarkerSubtitle(marker, regionLookup),
    healthStatus: marker.healthStatus,
    metrics: [
      ...(marker.kind === "region" ? [{ label: "Sites", value: marker.metrics.sites ?? 0 }] : []),
      ...(typeof marker.metrics.rooms === "number" ? [{ label: "Rooms", value: marker.metrics.rooms }] : []),
      ...(typeof marker.metrics.rows === "number" ? [{ label: "Rows", value: marker.metrics.rows }] : []),
      { label: "Racks", value: marker.metrics.racks },
      { label: "Devices", value: marker.metrics.devices },
      { label: "Warning", value: marker.metrics.warning },
      { label: "Critical", value: marker.metrics.critical },
      { label: "Alerts", value: marker.metrics.activeAlerts },
      ...(typeof marker.metrics.occupancyPercent === "number"
        ? [{ label: "Occupancy", value: `${marker.metrics.occupancyPercent}%` }]
        : []),
    ],
  };
}

export function buildStatusTone(palette: GlobePalette): Record<HealthStatus, string> {
  return {
    Healthy: palette.healthy,
    Warning: palette.warning,
    Critical: palette.critical,
    Offline: palette.offline,
    Maintenance: palette.maintenance,
  };
}
