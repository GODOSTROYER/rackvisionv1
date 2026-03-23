import { RackViewModel } from "@/components/rackvision/types";

export function RackSummaryStrip({ model }: { model: RackViewModel }) {
  const items = [
    ["Occupancy", `${model.occupancyPercent}%`],
    ["Used / Free U", `${model.usedUnits}/${model.availableUnits}`],
    ["Device Count", String(model.rack.deviceCount)],
    ["Alerts", String(model.rack.alertCount)],
    ["Power Load", `${model.rack.powerLoadKw}kW`],
    ["Avg Temp", `${model.rack.avgTemperature}°C`],
  ] as const;

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-card p-2 text-xs">
          <p className="text-muted-foreground">{label}</p>
          <p className="font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}
