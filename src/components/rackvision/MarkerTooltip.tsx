import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import type { GlobeMarker } from "@/components/rackvision/types";

type MarkerTooltipProps = {
  marker: GlobeMarker;
  regionName?: string;
};

function getMarkerSubtitle(marker: GlobeMarker, regionName?: string): string | undefined {
  if (marker.kind === "site") {
    return `${marker.city ?? ""}, ${marker.country ?? ""}`;
  }

  return regionName;
}

function getMarkerMetrics(marker: GlobeMarker, regionName?: string) {
  const metrics = [];

  if (marker.kind === "region") {
    metrics.push({ label: "Sites", value: marker.metrics.sites ?? 0 });
  }

  if (marker.kind === "site") {
    metrics.push({ label: "Region", value: regionName ?? "-" });
  }

  metrics.push({ label: "Racks", value: marker.metrics.racks });
  metrics.push({ label: "Devices", value: marker.metrics.devices });
  metrics.push({ label: "Warning", value: marker.metrics.warning });
  metrics.push({ label: "Critical", value: marker.metrics.critical });
  metrics.push({ label: "Alerts", value: marker.metrics.activeAlerts });

  if (typeof marker.metrics.occupancyPercent === "number") {
    metrics.push({ label: "Occupancy", value: `${marker.metrics.occupancyPercent}%` });
  }

  return metrics;
}

export function MarkerTooltip({ marker, regionName }: MarkerTooltipProps) {
  const summary = {
    id: marker.id,
    kind: marker.kind,
    title: marker.name,
    subtitle: getMarkerSubtitle(marker, regionName),
    healthStatus: marker.healthStatus,
    metrics: getMarkerMetrics(marker, regionName),
  };

  return <EntityHoverSummaryCard summary={summary} />;
}
