import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { SiteCardSummary } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type RegionSitesPanelProps = {
  sites: SiteCardSummary[];
  onSelectSite: (siteId: string) => void;
};

export function RegionSitesPanel({ sites, onSelectSite }: RegionSitesPanelProps) {
  if (!sites.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        No sites available in this region.
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sites in Region</p>
      <div className="grid gap-2 md:grid-cols-2">
        {sites.map((site) => (
          <article key={site.siteId} className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{site.name}</p>
              <StatusBadge status={site.healthStatus} />
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">{site.city}, {site.country}</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
              <p>Racks: <span className="text-foreground">{site.racks}</span></p>
              <p>Devices: <span className="text-foreground">{site.devices}</span></p>
              <p>Alerts: <span className="text-foreground">{site.alerts}</span></p>
              <p>Occupancy: <span className="text-foreground">{site.occupancyPercent}%</span></p>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => onSelectSite(site.siteId)}>Open Site</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
