import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbBarPlaceholder } from "@/components/rackvision/BreadcrumbBarPlaceholder";
import { CanvasPlaceholder } from "@/components/rackvision/CanvasPlaceholder";
import { FilterBarPlaceholder } from "@/components/rackvision/FilterBarPlaceholder";
import { HierarchyPanelPlaceholder } from "@/components/rackvision/HierarchyPanelPlaceholder";
import { InspectorPlaceholder } from "@/components/rackvision/InspectorPlaceholder";
import { RackVisionHeader } from "@/components/rackvision/RackVisionHeader";
import { RackVisionProvider, useRackVision } from "@/components/rackvision/RackVisionContext";
import { ViewModeSwitchPlaceholder } from "@/components/rackvision/ViewModeSwitchPlaceholder";
import { Region } from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { MockDataService } from "@/services/rackvision/MockDataService";

function RackVisionWorkspace() {
  const { state, dispatch } = useRackVision();
  const navigate = useNavigate();
  const { regionId: regionParam } = useParams();

  const [regions, setRegions] = useState<Region[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const loadedRegions = await MockDataService.getRegions();
      setRegions(loadedRegions);

      const initialRegionId = regionParam ?? loadedRegions[0]?.id ?? null;
      if (initialRegionId) {
        dispatch({ type: "SELECT_ENTITY", payload: { id: initialRegionId, kind: "region" } });
        const crumbs = await MockDataService.getBreadcrumbs(initialRegionId);
        dispatch({ type: "SET_BREADCRUMBS", payload: crumbs });
        const regionSites = await MockDataService.getSitesByRegion(initialRegionId);
        setSites(regionSites.map((site) => ({ id: site.id, name: site.name })));
      }
      dispatch({ type: "SET_LOADING", payload: false });
    };

    load();
  }, [dispatch, regionParam]);

  const selectedRegionId = state.selectedEntityKind === "region" ? state.selectedEntityId : null;
  const selectedSiteId = useMemo(() => sites[0]?.id ?? null, [sites]);

  const handleRegionChange = async (regionId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SELECT_ENTITY", payload: { id: regionId, kind: "region" } });
    const crumbs = await MockDataService.getBreadcrumbs(regionId);
    dispatch({ type: "SET_BREADCRUMBS", payload: crumbs });
    const regionSites = await MockDataService.getSitesByRegion(regionId);
    setSites(regionSites.map((site) => ({ id: site.id, name: site.name })));
    dispatch({ type: "SET_LOADING", payload: false });
    navigate(`/dashboard/rackvision/region/${regionId}`);
  };

  return (
    <section className="space-y-4">
      <RackVisionHeader
        searchQuery={state.searchQuery}
        onSearchQueryChange={(value) => dispatch({ type: "SET_SEARCH", payload: value })}
        regionId={selectedRegionId}
        siteId={selectedSiteId}
        regions={regions}
        sites={sites}
        onRegionChange={handleRegionChange}
        onSiteChange={() => {
          toast({ title: "Site selector", description: "Step 1 scaffold only." });
        }}
        onRefresh={() => {
          toast({ title: "Refreshed", description: "Mock data service re-sync placeholder." });
        }}
        onExport={() => {
          toast({ title: "Export Snapshot", description: "UI-only placeholder action." });
        }}
      />

      <ViewModeSwitchPlaceholder />
      <FilterBarPlaceholder />
      <BreadcrumbBarPlaceholder />

      {state.isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-[220px]" />
          <Skeleton className="h-[220px]" />
          <Skeleton className="h-[220px]" />
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <HierarchyPanelPlaceholder regions={regions} selectedRegionId={selectedRegionId} onSelectRegion={handleRegionChange} />
          <CanvasPlaceholder />
          <InspectorPlaceholder />
        </div>
      )}
    </section>
  );
}

export default function RackVisionPage() {
  return (
    <RackVisionProvider>
      <RackVisionWorkspace />
    </RackVisionProvider>
  );
}
