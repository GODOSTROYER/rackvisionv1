import { Building2, Globe2, MapPin } from "lucide-react";
import { CountryInfrastructureSummary } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { MiniSummaryCard } from "./MiniSummaryCard";
import { StatusDot } from "./StatusDot";

type CountryInfrastructurePanelProps = {
  loading: boolean;
  summary: CountryInfrastructureSummary | null;
  sites: Array<{
    site: { id: string; name: string; city: string; country: string; healthStatus: CountryInfrastructureSummary["healthStatus"] };
    summary: { totalRacks: number; totalDevices: number; activeAlerts: number; occupancyPercent: number };
  }>;
  onSelectSite: (siteId: string) => void;
};

export function CountryInfrastructurePanel({ loading, summary, sites, onSelectSite }: CountryInfrastructurePanelProps) {
  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading country infrastructure…</div>;
  }

  if (!summary) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{summary.countryName}</p>
            <p className="text-xs text-muted-foreground">Country infrastructure summary</p>
          </div>
        </div>
        <StatusDot status={summary.healthStatus} className="h-2.5 w-2.5" />
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <MiniSummaryCard label="Sites" value={String(summary.sites)} />
        <MiniSummaryCard label="Rooms" value={String(summary.rooms)} />
        <MiniSummaryCard label="Rows" value={String(summary.rows)} />
        <MiniSummaryCard label="Racks" value={String(summary.racks)} />
        <MiniSummaryCard label="Devices" value={String(summary.devices)} />
      </div>

      {summary.hasInfrastructure ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Sites / Data Centers in Country</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map(({ site, summary: siteSummary }) => (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectSite(site.id)}
                className="rounded-lg border border-border bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{site.name}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {site.city}, {site.country}
                      </p>
                    </div>
                  </div>
                  <StatusDot status={site.healthStatus} />
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <p>
                    Racks: <span className="text-foreground">{siteSummary.totalRacks}</span>
                  </p>
                  <p>
                    Devices: <span className="text-foreground">{siteSummary.totalDevices}</span>
                  </p>
                  <p>
                    Alerts: <span className="text-foreground">{siteSummary.activeAlerts}</span>
                  </p>
                  <p>
                    Occupancy: <span className="text-foreground">{siteSummary.occupancyPercent}%</span>
                  </p>
                </div>

                <Button size="sm" variant="outline" className="mt-3 w-full">
                  Open Site Context
                </Button>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          No managed sites mapped to this country yet.
        </div>
      )}
    </section>
  );
}