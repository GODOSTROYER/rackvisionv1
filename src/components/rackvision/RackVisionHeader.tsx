import { Download, RefreshCw } from "lucide-react";
import { GlobalSearchBar } from "@/components/rackvision/GlobalSearchBar";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RackVisionHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  regionId: string;
  siteId: string;
  statusFilter: string;
  deviceTypeFilter: string;
  regions: { id: string; name: string }[];
  sites: { id: string; name: string }[];
  onRegionChange: (value: string) => void;
  onSiteChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onDeviceTypeFilterChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
};

export function RackVisionHeader(props: RackVisionHeaderProps) {
  return (
    <div className="space-y-3">
      <PageHeader title="RackVision" subtitle="Visual infrastructure hierarchy and rack explorer" />
      <div className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <GlobalSearchBar value={props.search} onChange={props.onSearchChange} />
        </div>
        <Select value={props.regionId} onValueChange={props.onRegionChange}>
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
        <Select value={props.siteId} onValueChange={props.onSiteChange}>
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
        <Select value={props.statusFilter} onValueChange={props.onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: "all", label: "All Status" },
              { value: "Healthy", label: "Healthy" },
              { value: "Warning", label: "Warning" },
              { value: "Critical", label: "Critical" },
              { value: "Offline", label: "Offline" },
              { value: "Maintenance", label: "Maintenance" },
            ].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={props.deviceTypeFilter} onValueChange={props.onDeviceTypeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Device type" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: "all", label: "All Devices" },
              { value: "Server", label: "Servers" },
              { value: "Storage", label: "Storage" },
              { value: "Switch", label: "Network" },
              { value: "Firewall", label: "Security" },
            ].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
