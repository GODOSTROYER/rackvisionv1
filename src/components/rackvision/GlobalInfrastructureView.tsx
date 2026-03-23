import { InfraRegion, InfraSite } from "@/data/mockData";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type GlobalInfrastructureViewProps = {
  regions: InfraRegion[];
  sites: InfraSite[];
  selectedRegionId: string;
  onSelectRegion: (regionId: string) => void;
};

export function GlobalInfrastructureView({ regions, sites, selectedRegionId, onSelectRegion }: GlobalInfrastructureViewProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Global Infrastructure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto aspect-square max-w-[560px] rounded-full border border-border bg-gradient-to-b from-muted/60 to-background p-6">
          <div className="absolute inset-5 rounded-full border border-border/70" />
          <div className="absolute inset-9 rounded-full border border-border/70" />
          <div className="absolute inset-0 animate-[spin_80s_linear_infinite] rounded-full border border-transparent bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_40%)]" />
          {sites.map((site) => (
            <HoverCard key={site.id}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelectRegion(site.regionId)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${site.markerX}%`, top: `${site.markerY}%` }}
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                  </span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 border-border bg-card">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{site.name}</p>
                    <StatusBadge status={site.status} />
                  </div>
                  <p className="text-muted-foreground">{site.city}, {site.country}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Racks: <span className="text-foreground">{site.racksCount}</span></p>
                    <p>Devices: <span className="text-foreground">{site.devicesCount}</span></p>
                    <p>Alerts: <span className="text-foreground">{site.activeAlerts}</span></p>
                    <p>Capacity: <span className="text-foreground">{site.occupancy}%</span></p>
                    <p>Power: <span className="text-foreground">{site.powerUtilization}%</span></p>
                    <p>Last sync: <span className="text-foreground">{site.lastAudit}</span></p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region.id)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                selectedRegionId === region.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
