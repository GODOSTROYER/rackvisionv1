import { InfraRack, InfraRegion, InfraRoom, InfraRow, InfraSite } from "@/data/mockData";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type HierarchyExplorerProps = {
  regions: InfraRegion[];
  sites: InfraSite[];
  rooms: InfraRoom[];
  rows: InfraRow[];
  racks: InfraRack[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedRegionId: string;
  selectedSiteId: string;
  selectedRoomId: string;
  selectedRowId: string;
  selectedRackId: string;
  onSelectRegion: (value: string) => void;
  onSelectSite: (value: string) => void;
  onSelectRoom: (value: string) => void;
  onSelectRow: (value: string) => void;
  onSelectRack: (value: string) => void;
};

function ExplorerButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
        active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/50"
      }`}
    >
      {label}
    </button>
  );
}

export function HierarchyExplorer(props: HierarchyExplorerProps) {
  const filteredRacks = props.racks.filter((rack) => rack.name.toLowerCase().includes(props.query.toLowerCase()));

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Hierarchy Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={props.query} onChange={(event) => props.onQueryChange(event.target.value)} placeholder="Search region/site/rack" />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Regions</p>
          {props.regions.map((region) => (
            <ExplorerButton
              key={region.id}
              active={props.selectedRegionId === region.id}
              label={region.name}
              onClick={() => props.onSelectRegion(region.id)}
            />
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sites</p>
          {props.sites.map((site) => (
            <div key={site.id} className="flex items-center gap-2">
              <ExplorerButton
                active={props.selectedSiteId === site.id}
                label={site.name}
                onClick={() => props.onSelectSite(site.id)}
              />
              <StatusBadge status={site.status} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rooms / Rows</p>
          {props.rooms.map((room) => (
            <div key={room.id} className="space-y-1 rounded-md border border-border p-2">
              <ExplorerButton
                active={props.selectedRoomId === room.id}
                label={room.name}
                onClick={() => props.onSelectRoom(room.id)}
              />
              {props.rows
                .filter((row) => row.roomId === room.id)
                .map((row) => (
                  <div key={row.id} className="pl-2">
                    <ExplorerButton
                      active={props.selectedRowId === row.id}
                      label={row.name}
                      onClick={() => props.onSelectRow(row.id)}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Racks</p>
          {filteredRacks.map((rack) => (
            <ExplorerButton
              key={rack.id}
              active={props.selectedRackId === rack.id}
              label={rack.name}
              onClick={() => props.onSelectRack(rack.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
