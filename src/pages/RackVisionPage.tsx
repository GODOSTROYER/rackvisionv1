import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbBar } from "@/components/rackvision/BreadcrumbBar";
import { FilterBarPlaceholder } from "@/components/rackvision/FilterBarPlaceholder";
import { GlobalInfrastructureView } from "@/components/rackvision/GlobalInfrastructureView";
import { HierarchyPanel } from "@/components/rackvision/HierarchyPanel";
import { InspectorPanel } from "@/components/rackvision/InspectorPanel";
import { RackVisionHeader } from "@/components/rackvision/RackVisionHeader";
import { RackVisionProvider, useRackVision } from "@/components/rackvision/RackVisionContext";
import { ViewModeSwitchPlaceholder } from "@/components/rackvision/ViewModeSwitchPlaceholder";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import { GlobalSummary, GlobeMarker, HierarchyNode, RackVisionEntityKind, Region, RegionSummary, SiteSummary } from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { MockDataService } from "@/services/rackvision/MockDataService";

function RackVisionWorkspace() {
  const { state, dispatch } = useRackVision();
  const navigate = useNavigate();
  const { regionId: regionParam, siteId: siteParam, rackId: rackParam } = useParams();

  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [inspectorSummary, setInspectorSummary] = useState<InspectorSummary | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [globalSummary, setGlobalSummary] = useState<GlobalSummary | null>(null);
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [regionSummary, setRegionSummary] = useState<RegionSummary | null>(null);
  const [siteSummary, setSiteSummary] = useState<SiteSummary | null>(null);

  const selectedRegionId = useMemo(() => {
    const regionCrumb = [...state.breadcrumbs].reverse().find((crumb) => crumb.kind === "region");
    return regionCrumb?.id ?? null;
  }, [state.breadcrumbs]);

  const selectedSiteId = useMemo(() => {
    const siteCrumb = [...state.breadcrumbs].reverse().find((crumb) => crumb.kind === "site");
    return siteCrumb?.id ?? null;
  }, [state.breadcrumbs]);

  const selectedEntityName = useMemo(() => {
    const last = state.breadcrumbs[state.breadcrumbs.length - 1];
    return last && last.id !== "global" ? last.label : null;
  }, [state.breadcrumbs]);

  const regionLookup = useMemo(() => Object.fromEntries(regions.map((region) => [region.id, region.name])), [regions]);

  const selectEntity = async (id: string | null, kindOverride?: RackVisionEntityKind | null) => {
    if (!id) return;
    dispatch({ type: "SET_LOADING", payload: true });
    const entity = await MockDataService.getEntityById(id);
    const kind = kindOverride ?? entity?.kind ?? null;
    const breadcrumbs = await MockDataService.getBreadcrumbs(id);
    dispatch({ type: "SET_SELECTED_ENTITY", payload: { id, kind } });
    dispatch({ type: "SET_INSPECTOR_ENTITY", payload: id });
    dispatch({ type: "SET_SELECTED_MARKER", payload: id });
    dispatch({ type: "SET_BREADCRUMBS", payload: breadcrumbs });
    dispatch({ type: "SET_EXPANDED_NODES", payload: breadcrumbs.slice(1, -1).map((crumb) => crumb.id) });

    const roomCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.kind === "room");
    const rowCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.kind === "row");
    const rackCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.kind === "rack");
    dispatch({ type: "SET_SELECTED_ROOM", payload: roomCrumb?.id ?? null });
    dispatch({ type: "SET_SELECTED_ROW", payload: rowCrumb?.id ?? null });
    dispatch({ type: "SET_SELECTED_RACK", payload: rackCrumb?.id ?? null });
    if (kind !== "rack") dispatch({ type: "CLOSE_RACK_PREVIEW" });

    const regionCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.kind === "region");
    if (regionCrumb) {
      const regionSites = await MockDataService.getSitesByRegion(regionCrumb.id);
      setSites(regionSites.map((site) => ({ id: site.id, name: site.name })));
    }
    dispatch({ type: "SET_LOADING", payload: false });
  };

  useEffect(() => {
    const load = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const [loadedRegions, loadedTree, summary, allSites] = await Promise.all([
        MockDataService.getRegions(),
        MockDataService.getHierarchyTree(),
        MockDataService.getGlobalInfrastructureSummary(),
        MockDataService.getSitesWithCoordinates(),
      ]);
      setRegions(loadedRegions);
      setTree(loadedTree);
      setGlobalSummary(summary);
      setSites(allSites.map((site) => ({ id: site.id, name: site.name })));

      const initialEntityId = rackParam ?? siteParam ?? regionParam ?? null;
      if (initialEntityId) await selectEntity(initialEntityId);
      else dispatch({ type: "SET_LOADING", payload: false });
    };
    load();
  }, [dispatch, rackParam, regionParam, siteParam]);

  useEffect(() => {
    const loadGlobal = async () => {
      setGlobalLoading(true);
      const { regionMarkers, siteMarkers } = await MockDataService.getMarkerData(
        state.globalViewMode === "sites" && selectedRegionId ? selectedRegionId : undefined,
      );
      setMarkers(state.globalViewMode === "regions" ? regionMarkers : siteMarkers);
      setGlobalLoading(false);
    };
    loadGlobal();
  }, [selectedRegionId, state.globalViewMode]);

  useEffect(() => {
    if (!state.inspectorEntityId) {
      setInspectorSummary(null);
      return;
    }
    const loadInspector = async () => {
      setInspectorLoading(true);
      const summary = await MockDataService.getEntitySummary(state.inspectorEntityId);
      setInspectorSummary(summary as InspectorSummary | null);
      setInspectorLoading(false);
    };
    loadInspector();
  }, [state.inspectorEntityId]);

  useEffect(() => {
    const loadScopedSummary = async () => {
      if (state.selectedEntityKind === "region" && state.selectedEntityId) {
        setRegionSummary(await MockDataService.getRegionSummary(state.selectedEntityId));
      } else {
        setRegionSummary(null);
      }
      if (state.selectedEntityKind === "site" && state.selectedEntityId) {
        setSiteSummary(await MockDataService.getSiteSummary(state.selectedEntityId));
      } else {
        setSiteSummary(null);
      }
    };
    loadScopedSummary();
  }, [state.selectedEntityId, state.selectedEntityKind]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: "SET_TREE_RESULTS", payload: [] });
      return;
    }
    const results = await MockDataService.searchHierarchy(query);
    dispatch({ type: "SET_TREE_RESULTS", payload: results.matchedIds });
    dispatch({ type: "SET_EXPANDED_NODES", payload: results.expandedIds });
  };

  const handleRegionChange = async (regionId: string) => {
    await selectEntity(regionId, "region");
    navigate(`/dashboard/rackvision/region/${regionId}`);
  };

  const handleSiteChange = async (siteId: string) => {
    await selectEntity(siteId, "site");
    navigate(`/dashboard/rackvision/site/${siteId}`);
  };

  const handleEntitySelect = async (entityId: string) => {
    await selectEntity(entityId);
  };

  const handleOpenDevice = async (deviceId: string) => {
    await selectEntity(deviceId, "device");
    toast({ title: "Open System Details", description: "Navigating to system details placeholder." });
    navigate(`/systems/${deviceId}`);
  };

  const handleBreadcrumbSelect = async (id: string) => {
    if (id === "global") {
      dispatch({ type: "SET_SELECTED_ENTITY", payload: { id: null, kind: null } });
      dispatch({ type: "SET_INSPECTOR_ENTITY", payload: null });
      dispatch({ type: "SET_SELECTED_MARKER", payload: null });
      dispatch({ type: "SET_HOVERED_ENTITY", payload: null });
      dispatch({ type: "SET_SELECTED_ROOM", payload: null });
      dispatch({ type: "SET_SELECTED_ROW", payload: null });
      dispatch({ type: "SET_SELECTED_RACK", payload: null });
      dispatch({ type: "CLOSE_RACK_PREVIEW" });
      dispatch({ type: "SET_BREADCRUMBS", payload: [{ id: "global", label: "Global", kind: "global" }] });
      return;
    }
    await selectEntity(id);
  };

  const handleOpenRack = async (rackId: string) => {
    dispatch({ type: "OPEN_RACK_PREVIEW", payload: rackId });
    await selectEntity(rackId, "rack");
    navigate(`/dashboard/rackvision/rack/${rackId}`);
  };

  return (
    <section className="space-y-4">
      <RackVisionHeader
        searchQuery={state.searchQuery}
        onSearchQueryChange={(value) => {
          dispatch({ type: "SET_TREE_SEARCH", payload: value });
          handleSearch(value);
        }}
        regionId={selectedRegionId}
        siteId={selectedSiteId}
        regions={regions}
        sites={sites}
        onRegionChange={handleRegionChange}
        onSiteChange={handleSiteChange}
        onRefresh={() => {
          toast({ title: "Refreshed", description: "Mock data service re-sync placeholder." });
        }}
        onExport={() => {
          toast({ title: "Export Snapshot", description: "UI-only placeholder action." });
        }}
      />

      <ViewModeSwitchPlaceholder />
      <FilterBarPlaceholder />
      <BreadcrumbBar onSelectBreadcrumb={handleBreadcrumbSelect} />

      {state.isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-[220px]" />
          <Skeleton className="h-[220px]" />
          <Skeleton className="h-[220px]" />
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <HierarchyPanel nodes={tree} onSearch={handleSearch} onSelectEntity={handleEntitySelect} onOpenDevice={handleOpenDevice} />
          <GlobalInfrastructureView
            loading={globalLoading}
            summary={globalSummary}
            markers={markers}
            selectedEntityId={state.selectedEntityId}
            selectedEntityKind={state.selectedEntityKind}
            selectedRegionId={selectedRegionId}
            selectedSiteId={selectedSiteId}
            selectedEntityName={selectedEntityName}
            selectedMarkerId={state.selectedMarkerId ?? state.selectedEntityId}
            hoveredMarkerId={state.hoveredEntityId}
            regionSummary={regionSummary}
            siteSummary={siteSummary}
            regionLookup={regionLookup}
            onHoverMarker={(id) => dispatch({ type: "SET_HOVERED_ENTITY", payload: id })}
            onSelectMarker={async (id) => {
              dispatch({ type: "SET_SELECTED_MARKER", payload: id });
              await handleEntitySelect(id);
            }}
            onSelectEntity={handleEntitySelect}
            onOpenRack={handleOpenRack}
            onOpenDevice={handleOpenDevice}
            globalViewMode={state.globalViewMode}
            onGlobalViewModeChange={(mode) => dispatch({ type: "SET_GLOBAL_VIEW_MODE", payload: mode })}
          />
          <InspectorPanel loading={inspectorLoading} summary={inspectorSummary} />
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
