import { Building2, FolderTree, Rows4, Server } from "lucide-react";
import { Region } from "@/components/rackvision/types";

type HierarchyPanelPlaceholderProps = {
  regions: Region[];
  selectedRegionId: string | null;
  onSelectRegion: (id: string) => void;
};

export function HierarchyPanelPlaceholder({ regions, selectedRegionId, onSelectRegion }: HierarchyPanelPlaceholderProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Hierarchy</h2>
        <span className="text-xs text-muted-foreground">Step 1 placeholder</span>
      </div>

      <div className="space-y-2">
        <div className="rounded-md border border-border bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">Global / Region → Site → Room → Row</div>
        {regions.map((region) => {
          const active = selectedRegionId === region.id;
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onSelectRegion(region.id)}
              className={`w-full rounded-md border px-2 py-2 text-left transition-colors ${
                active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="h-4 w-4" /> {region.name}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FolderTree className="h-3.5 w-3.5" /> Sites
                </span>
                <span className="inline-flex items-center gap-1">
                  <Rows4 className="h-3.5 w-3.5" /> Rows
                </span>
                <span className="inline-flex items-center gap-1">
                  <Server className="h-3.5 w-3.5" /> Racks
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
