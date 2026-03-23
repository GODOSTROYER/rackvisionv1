import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
import { CountryInfrastructurePanel } from "@/components/rackvision/CountryInfrastructurePanel";
import { GlobeLegend } from "@/components/rackvision/GlobeLegend";
import { GlobalSummaryCards } from "@/components/rackvision/GlobalSummaryCards";
import { GlobalViewEmptyState } from "@/components/rackvision/GlobalViewEmptyState";
import { GlobalViewSkeleton } from "@/components/rackvision/GlobalViewSkeleton";
import { InfrastructureGlobe } from "@/components/rackvision/InfrastructureGlobe";
import { RegionSummaryPanel } from "@/components/rackvision/RegionSummaryPanel";
import { SelectionHintBanner } from "@/components/rackvision/SelectionHintBanner";
import { SiteInfrastructureOverlay } from "@/components/rackvision/SiteInfrastructureOverlay";
import { SiteOverviewCanvas } from "@/components/rackvision/SiteOverviewCanvas";
import { GlobalSummary, GlobeMarker, RackVisionEntityKind, RegionSummary, SiteSummary } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { MockDataService } from "@/services/rackvision/MockDataService";

type GlobalInfrastructureViewProps = {
  forceGlobalView?: boolean;
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
  forceGlobalView = false,
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
  siteSummary,
  regionLookup,
  onHoverMarker,
  onSelectMarker,
  onSelectEntity,
  onOpenRack,
  onOpenDevice,
  globalViewMode,
  onGlobalViewModeChange,
}: GlobalInfrastructureViewProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [countrySummary, setCountrySummary] = useState<Awaited<ReturnType<typeof MockDataService.getCountryInfrastructureSummary>> | null>(null);
  const [countrySites, setCountrySites] = useState<Awaited<ReturnType<typeof MockDataService.getCountrySites>>>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [selectedSiteOverlay, setSelectedSiteOverlay] = useState<Awaited<ReturnType<typeof MockDataService.getSiteInfrastructureSummary>> | null>(null);

  useEffect(() => {
    const loadSiteOverlay = async () => {
      if (selectedEntityKind !== "site" || !selectedEntityId) {
        setSelectedSiteOverlay(null);
        return;
      }
      setSelectedSiteOverlay(await MockDataService.getSiteInfrastructureSummary(selectedEntityId));
    };
    loadSiteOverlay();
  }, [selectedEntityId, selectedEntityKind]);

  useEffect(() => {
    if (selectedEntityKind === "site" && selectedEntityId) {
      setSelectedCountryCode(null);
      setCountrySummary(null);
      setCountrySites([]);
    }
  }, [selectedEntityId, selectedEntityKind]);

  const loadCountryContext = async (countryCode: string) => {
    setCountryLoading(true);
    setSelectedCountryCode(countryCode);
    try {
      const [summary, sitesInCountry] = await Promise.all([
        MockDataService.getCountryInfrastructureSummary(countryCode),
        MockDataService.getCountrySites(countryCode),
      ]);
      setCountrySummary(summary);
      setCountrySites(sitesInCountry);
    } finally {
      setCountryLoading(false);
    }
  };

  if (!forceGlobalView && selectedEntityKind && ["site", "room", "row", "rack", "device"].includes(selectedEntityKind)) {
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
  if (!summary) return <GlobalViewEmptyState />;

  const hint =
    selectedEntityKind === "site"
      ? "Site selected — globe stays active while site, room, row, and rack context layers deepen below."
      : selectedEntityKind === "region"
        ? "Region selected — use country or site interactions to drill down and sync hierarchy + inspector."
        : "Hover countries for in-country summaries, then click country or site markers to drill down.";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-2">
        <div className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
          <Globe2 className="h-4 w-4" /> Global Infrastructure View
          {selectedEntityName ? <span className="text-muted-foreground">• {selectedEntityName}</span> : null}
        </div>
        <div className="flex gap-1">
          <Button variant={globalViewMode === "regions" ? "default" : "outline"} size="sm" onClick={() => onGlobalViewModeChange("regions")} aria-pressed={globalViewMode === "regions"}>Regions</Button>
          <Button variant={globalViewMode === "sites" ? "default" : "outline"} size="sm" onClick={() => onGlobalViewModeChange("sites")} aria-pressed={globalViewMode === "sites"}>Sites</Button>
        </div>
      </div>

      <SelectionHintBanner text={hint} />
      <GlobalSummaryCards summary={summary} />

      <InfrastructureGlobe
        markers={markers}
        selectedMarkerId={selectedMarkerId}
        hoveredMarkerId={hoveredMarkerId}
        selectedCountryCode={selectedCountryCode}
        onHoverMarker={onHoverMarker}
        onSelectMarker={onSelectMarker}
        onSelectCountry={async (countryCode) => {
          await loadCountryContext(countryCode);
        }}
        regionLookup={regionLookup}
      />

      <GlobeLegend />

      {selectedCountryCode ? (
        <CountryInfrastructurePanel
          loading={countryLoading}
          summary={countrySummary}
          sites={countrySites}
          onSelectSite={async (siteId) => {
            await onSelectEntity(siteId);
            onSelectMarker(siteId);
          }}
        />
      ) : null}

      {selectedEntityKind === "region" && regionSummary ? <RegionSummaryPanel summary={regionSummary} /> : null}
      {selectedEntityKind === "site" && siteSummary && selectedSiteOverlay?.site ? (
        <SiteInfrastructureOverlay
          siteName={selectedSiteOverlay.site.name}
          summary={siteSummary}
          roomCount={selectedSiteOverlay.roomCount}
          rowCount={selectedSiteOverlay.rowCount}
        />
      ) : null}
    </section>
  );
}
