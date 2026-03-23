import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { QuickActionButtons } from "@/components/rackvision/QuickActionButtons";
import { InspectorSummary } from "@/components/rackvision/inspector-types";

export function RackInspector({ summary }: { summary: InspectorSummary }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{summary.entity.name}</h3>
        <p className="text-xs text-muted-foreground">Rack</p>
        <div className="mt-1"><StatusBadge status={summary.entity.healthStatus} /></div>
      </div>
      <MetricRow label="Occupancy" value={`${summary.entity.kind === "rack" ? summary.entity.occupancyPercent : 0}%`} />
      <MetricRow label="Total Units" value={String(summary.entity.kind === "rack" ? summary.entity.totalUnits : 42)} />
      <MetricRow label="Used Units" value={String(summary.usedUnits ?? 0)} />
      <MetricRow label="Available Units" value={String(summary.availableUnits ?? 0)} />
      <MetricRow label="Devices" value={String(summary.counts.devices)} />
      <MetricRow label="Power Load" value={`${summary.rackMetrics?.powerLoadKw ?? 0} kW`} />
      <MetricRow label="Thermal State" value={summary.rackMetrics?.temperatureState ?? "Stable"} />
      <QuickActionButtons
        onOpenSystem={() => {
          const firstDevice = summary.children.find((child) => child.kind === "device");
          if (firstDevice && summary.entity.kind === "rack") {
            navigate(`/systems/${firstDevice.id}?back=${encodeURIComponent(`/dashboard/rackvision/rack/${summary.entity.id}`)}`);
          }
          else toast({ title: "No device linked", description: "Rack has no device records in mock data." });
        }}
        onAction={(action) => {
          toast({ title: action, description: "UI-only RackVision action." });
        }}
      />
    </div>
  );
}
