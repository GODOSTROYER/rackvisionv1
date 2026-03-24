import { Download, RefreshCw } from "lucide-react";
import { GlobalSearchCommand } from "@/components/rackvision/GlobalSearchCommand";
import { RackVisionSearchResult } from "@/components/rackvision/types";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RackVisionHeaderProps = {
  searchQuery: string;
  searchResults: RackVisionSearchResult[];
  isSearchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onSearchQueryChange: (value: string) => void;
  onSearchResultSelect: (result: RackVisionSearchResult) => void;
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
      <div className="grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 xl:grid-cols-5">
        <GlobalSearchCommand
          query={props.searchQuery}
          results={props.searchResults}
          open={props.isSearchOpen}
          onOpenChange={props.onSearchOpenChange}
          onQueryChange={props.onSearchQueryChange}
          onSelectResult={props.onSearchResultSelect}
        />
        <Select value={props.regionId ?? undefined} onValueChange={props.onRegionChange}>
          <SelectTrigger aria-label="Select region">
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
          <SelectTrigger aria-label="Select site or data center">
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
          Search spans Regions/Sites/Rooms/Rows/Racks/Devices with context-aware drill-down.
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={props.onRefresh}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={props.onExport}>
          <Download className="mr-1 h-4 w-4" /> Export Snapshot
        </Button>
      </div>
    </div>
  );
}
