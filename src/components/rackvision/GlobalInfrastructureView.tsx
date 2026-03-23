import { Globe2 } from "lucide-react";
import { GlobalSummaryCards } from "@/components/rackvision/GlobalSummaryCards";
import { GlobalViewEmptyState } from "@/components/rackvision/GlobalViewEmptyState";
import { GlobalViewSkeleton } from "@/components/rackvision/GlobalViewSkeleton";
import { InfrastructureGlobe } from "@/components/rackvision/InfrastructureGlobe";
import { RegionSummaryPanel } from "@/components/rackvision/RegionSummaryPanel";
import { SelectionHintBanner } from "@/components/rackvision/SelectionHintBanner";
import { SiteOverviewCanvas } from "@/components/rackvision/SiteOverviewCanvas";
import { GlobalSummary, GlobeMarker, RackVisionEntityKind, RegionSummary, SiteSummary } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type GlobalInfrastructureViewProps = {
  loading: boolean;
  summary: GlobalSummary | null;
  markers: GlobeMarker[];
  selectedEntityId: string | null;
  selectedEntityKind: RackVisionEntityKind | null;
  selectedRegionId: string | null;
  selectedSiteId: string | null;
  selectedEntityName: string | null;
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  regionSummary: RegionSummary | null;
  siteSummary: SiteSummary | null;
  regionLookup: Record<string, string>;
  onHoverMarker: (id: string | null) => void;
  onSelectMarker: (id: string) => void;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenRack: (id: string) => Promise<void>;
  onOpenDevice: (id: string) => Promise<void>;
  globalViewMode: "regions" | "sites";
  onGlobalViewModeChange: (mode: "regions" | "sites") => void;
};

export function GlobalInfrastructureView({
  loading,
  summary,
  markers,
  selectedEntityId,
  selectedEntityKind,
  selectedRegionId,
  selectedSiteId,
  selectedEntityName,
  selectedMarkerId,
  hoveredMarkerId,
  regionSummary,
  siteSummary: _siteSummary,
  regionLookup,
  onHoverMarker,
  onSelectMarker,
  onSelectEntity,
  onOpenRack,
  onOpenDevice,
  globalViewMode,
  onGlobalViewModeChange,
}: GlobalInfrastructureViewProps) {
  if (selectedEntityKind && ["site", "room", "row", "rack", "device"].includes(selectedEntityKind)) {
    return (
      <SiteOverviewCanvas
        selectedEntityId={selectedEntityId}
        selectedEntityKind={selectedEntityKind}
        selectedRegionId={selectedRegionId}
        selectedSiteId={selectedSiteId}
        selectedEntityName={selectedEntityName}
        onSelectEntity={onSelectEntity}
        onOpenRack={onOpenRack}
        onOpenDevice={onOpenDevice}
      />
    );
  }

  if (loading) return <GlobalViewSkeleton />;
  if (!summary || !markers.length) return <GlobalViewEmptyState />;

  const hint =
    selectedEntityKind === "site"
      ? "Site selected — detailed Site Overview and Rack Navigation panels are coming next."
      : selectedEntityKind === "region"
        ? "Region selected — use markers or hierarchy to drill into a specific site."
        : "Select a region or site marker to drill down and sync hierarchy + inspector.";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-2">
        <div className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
          <Globe2 className="h-4 w-4" /> Global Infrastructure View
          {selectedEntityName ? <span className="text-muted-foreground">• {selectedEntityName}</span> : null}
        </div>
        <div className="flex gap-1">
          <Button variant={globalViewMode === "regions" ? "default" : "outline"} size="sm" onClick={() => onGlobalViewModeChange("regions")}>Regions</Button>
          <Button variant={globalViewMode === "sites" ? "default" : "outline"} size="sm" onClick={() => onGlobalViewModeChange("sites")}>Sites</Button>
        </div>
      </div>

      <SelectionHintBanner text={hint} />
      <GlobalSummaryCards summary={summary} />

      <InfrastructureGlobe
        markers={markers}
        selectedMarkerId={selectedMarkerId}
        hoveredMarkerId={hoveredMarkerId}
        onHoverMarker={onHoverMarker}
        onSelectMarker={onSelectMarker}
        regionLookup={regionLookup}
      />

      {selectedEntityKind === "region" && regionSummary ? <RegionSummaryPanel summary={regionSummary} /> : null}
    </section>
  );
}
