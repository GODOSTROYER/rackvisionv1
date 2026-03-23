import { SystemDetails } from "@/components/rackvision/types";

export function SystemMetricsCards({ details }: { details: SystemDetails }) {
  const cards = [
    ["CPU", `${details.cpuUsage}%`],
    ["Memory", `${details.memoryUsage}%`],
    ["Network I/O", details.networkIo],
    ["Temperature", `${details.temperature}°C`],
    ["Uptime", details.uptime],
    ["Alerts", String(details.alerts)],
  ] as const;

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-lg border border-border bg-card p-3 text-sm shadow-sm">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold text-foreground">{value}</p>
        </article>
      ))}
    </div>
  );
}
