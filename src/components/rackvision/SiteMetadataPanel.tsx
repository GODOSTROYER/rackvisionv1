import { SiteOverview } from "@/components/rackvision/types";

export function SiteMetadataPanel({ overview }: { overview: SiteOverview }) {
  const items = [
    ["Site", overview.site.name],
    ["Region", overview.regionName],
    ["City / Country", `${overview.site.city}, ${overview.site.country}`],
    ["Facility Type", overview.metadata.facilityType],
    ["Power Capacity", overview.metadata.powerCapacity],
    ["Cooling Status", overview.metadata.coolingStatus],
    ["Network Status", overview.metadata.networkStatus],
    ["Availability", overview.metadata.availability],
    ["Last Sync", overview.metadata.lastSync],
  ] as const;

  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">Site Metadata</p>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        {items.map(([label, value]) => (
          <p key={label} className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span>{label}</span>
            <span className="text-foreground">{value}</span>
          </p>
        ))}
      </div>
    </aside>
  );
}
