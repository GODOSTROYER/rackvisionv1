import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import { GlobeMarker } from "@/components/rackvision/types";

type MarkerTooltipProps = {
  marker: GlobeMarker;
  regionName?: string;
};

export function MarkerTooltip({ marker, regionName }: MarkerTooltipProps) {
  const summary = {
    id: marker.id,
    kind: marker.kind,
    title: marker.name,
    subtitle: marker.kind === "site" ? `${marker.city ?? ""}, ${marker.country ?? ""}` : regionName,
    healthStatus: marker.healthStatus,
    metrics: [
      ...(marker.kind === "region" ? [{ label: "Sites", value: marker.metrics.sites ?? 0 }] : []),
      ...(marker.kind === "site" ? [{ label: "Region", value: regionName ?? "-" }] : []),
      { label: "Racks", value: marker.metrics.racks },
      { label: "Devices", value: marker.metrics.devices },
      { label: "Warning", value: marker.metrics.warning },
      { label: "Critical", value: marker.metrics.critical },
      { label: "Alerts", value: marker.metrics.activeAlerts },
      ...(typeof marker.metrics.occupancyPercent === "number" ? [{ label: "Occupancy", value: `${marker.metrics.occupancyPercent}%` }] : []),
    ],
  } as const;

  return (
    <div>
      <EntityHoverSummaryCard summary={summary} />
      <div className="sr-only">
        <StatusBadge status={marker.healthStatus} />
      </div>
    </div>
  );
}
