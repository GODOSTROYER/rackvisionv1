import { Download, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RackVisionHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  regionId: string | null;
  siteId: string | null;
  regions: { id: string; name: string }[];
  sites: { id: string; name: string }[];
  onRegionChange: (value: string) => void;
  onSiteChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
};

export function RackVisionHeader(props: RackVisionHeaderProps) {
  return (
    <div className="space-y-3">
      <PageHeader title="RackVision" subtitle="Visual infrastructure hierarchy and rack explorer" />
      <div className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={props.searchQuery}
            onChange={(event) => props.onSearchQueryChange(event.target.value)}
            placeholder="Search hostname, system ID, rack, site, or IP"
            className="pl-8"
          />
        </div>
        <Select value={props.regionId ?? undefined} onValueChange={props.onRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            {props.regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.siteId ?? undefined} onValueChange={props.onSiteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Site / Data Center" />
          </SelectTrigger>
          <SelectContent>
            {props.sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="rounded-md border border-dashed border-border bg-muted/20 px-2 py-2 text-xs text-muted-foreground">
          View mode + filter placeholders below
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={props.onRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={props.onExport}>
          <Download className="mr-1 h-4 w-4" /> Export Snapshot
        </Button>
      </div>
    </div>
  );
}
