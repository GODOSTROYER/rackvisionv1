import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BreadcrumbBar } from "@/components/rackvision/BreadcrumbBar";
import { FilterBarPlaceholder } from "@/components/rackvision/FilterBarPlaceholder";
import { GlobalInfrastructureView } from "@/components/rackvision/GlobalInfrastructureView";
import { HierarchyPanel } from "@/components/rackvision/HierarchyPanel";
import { InspectorPanel } from "@/components/rackvision/InspectorPanel";
import { LayoutViewCanvas } from "@/components/rackvision/LayoutViewCanvas";
import { RackVisionHeader } from "@/components/rackvision/RackVisionHeader";
import { RackVisionViewModeSwitcher } from "@/components/rackvision/RackVisionViewModeSwitcher";
import { RackVisionProvider, useRackVision } from "@/components/rackvision/RackVisionContext";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { SiteOverviewCanvas } from "@/components/rackvision/SiteOverviewCanvas";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import {
  GlobalSummary,
  GlobeMarker,
  HierarchyNode,
  RackVisionEntityKind,
  RackVisionSearchResult,
  RackVisionViewMode,
  RackVisionSelectionContext,
  Region,
  RegionSummary,
  SiteSummary,
} from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { MockDataService } from "@/services/rackvision/MockDataService";

function RackVisionWorkspace() {
  const { state, dispatch } = useRackVision();
  const navigate = useNavigate();
  const { regionId: regionParam, siteId: siteParam, rackId: rackParam } = useParams();

  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [allSites, setAllSites] = useState<{ id: string; name: string }[]>([]);
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

  const routeEntityId = rackParam ?? siteParam ?? regionParam ?? null;

  const setSiteOptionsForContext = async (context: RackVisionSelectionContext, fallbackSites = allSites) => {
    if (context.regionId) {
      const regionSites = await MockDataService.getSitesByRegion(context.regionId);
      setSites(regionSites.map((site) => ({ id: site.id, name: site.name })));
      return;
    }
    setSites(fallbackSites);
  };

  const getRouteForSelection = (context: RackVisionSelectionContext, kind: RackVisionEntityKind | null) => {
    if (kind === "region" && context.regionId) return `/dashboard/rackvision/region/${context.regionId}`;
    if ((kind === "site" || kind === "room" || kind === "row") && context.siteId) return `/dashboard/rackvision/site/${context.siteId}`;
    if ((kind === "rack" || kind === "device") && context.rackId) return `/dashboard/rackvision/rack/${context.rackId}`;
    return "/dashboard/rackvision";
  };

  const selectEntity = async (
    id: string | null,
    options?: { kindOverride?: RackVisionEntityKind | null; updateRoute?: boolean; nextView?: RackVisionViewMode; fallbackSites?: { id: string; name: string }[] },
  ) => {
    if (!id) return null;
    dispatch({ type: "SET_LOADING", payload: true });
    const context = await MockDataService.getEntityContext(id);
    if (!context) {
      dispatch({ type: "SET_LOADING", payload: false });
      return null;
    }

    const kind = options?.kindOverride ?? context.entity.kind;
    dispatch({ type: "SET_SELECTED_ENTITY", payload: { id, kind } });
    dispatch({ type: "SET_INSPECTOR_ENTITY", payload: id });
    dispatch({ type: "SET_SELECTED_MARKER", payload: id });
    dispatch({ type: "SET_BREADCRUMBS", payload: context.breadcrumbs });
    dispatch({ type: "SET_EXPANDED_NODES", payload: context.breadcrumbs.slice(1, -1).map((crumb) => crumb.id) });
    dispatch({ type: "SET_SELECTED_ROOM", payload: context.roomId });
    dispatch({ type: "SET_SELECTED_ROW", payload: context.rowId });
    dispatch({ type: "SET_SELECTED_RACK", payload: context.rackId });
    dispatch({ type: "SET_SELECTED_DEVICE", payload: context.deviceId });
    dispatch({ type: "SET_ACTIVE_RACK", payload: context.rackId });
    dispatch({ type: "SET_LAYOUT_CONTEXT", payload: { siteId: context.siteId, roomId: context.roomId } });
    if (options?.nextView) dispatch({ type: "SET_ACTIVE_VIEW", payload: options.nextView });
    if (kind !== "rack" && kind !== "device") dispatch({ type: "CLOSE_RACK_PREVIEW" });

    await setSiteOptionsForContext(context, options?.fallbackSites);
    if (options?.updateRoute !== false) navigate(getRouteForSelection(context, kind));
    dispatch({ type: "SET_LOADING", payload: false });
    return context;
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
      const siteOptions = allSites.map((site) => ({ id: site.id, name: site.name }));
      setAllSites(siteOptions);
      setSites(siteOptions);

      if (routeEntityId) {
        await selectEntity(routeEntityId, {
          updateRoute: false,
          nextView: rackParam ? "rack" : siteParam ? "site" : "global",
          fallbackSites: siteOptions,
        });
      } else {
        dispatch({ type: "SET_ACTIVE_VIEW", payload: "global" });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    load();
  }, [dispatch, rackParam, regionParam, routeEntityId, siteParam]);

  useEffect(() => {
    const loadGlobal = async () => {
      setGlobalLoading(true);
      const { regionMarkers, siteMarkers } = await MockDataService.getMarkerData(
        state.globalViewMode === "sites" && selectedRegionId ? selectedRegionId : undefined,
      );
      const visible = (state.globalViewMode === "regions" ? regionMarkers : siteMarkers).filter((marker) => {
        if (state.activeFilters.status !== "all" && marker.healthStatus !== state.activeFilters.status) return false;
        if (state.activeFilters.offlineOnly && marker.healthStatus !== "Offline") return false;
        if (state.activeFilters.criticalOnly && marker.healthStatus !== "Critical") return false;
        return true;
      });
      setMarkers(visible);
      setGlobalLoading(false);
    };
    loadGlobal();
  }, [selectedRegionId, state.globalViewMode, state.activeFilters.criticalOnly, state.activeFilters.offlineOnly, state.activeFilters.status]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!state.globalSearchQuery.trim()) {
        dispatch({ type: "SET_GLOBAL_SEARCH_RESULTS", payload: [] });
        return;
      }
      const [results, filtered] = await Promise.all([
        MockDataService.searchRackVision(state.globalSearchQuery),
        MockDataService.getFilteredEntities(state.activeFilters),
      ]);
      const allowedIds = new Set(filtered.map((entity) => entity.id));
      dispatch({ type: "SET_GLOBAL_SEARCH_RESULTS", payload: results.filter((item) => allowedIds.has(item.id)) });
    }, 220);

    return () => window.clearTimeout(timer);
  }, [dispatch, state.activeFilters, state.globalSearchQuery]);

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
    await selectEntity(regionId, { kindOverride: "region", nextView: "global" });
  };

  const handleSiteChange = async (siteId: string) => {
    await selectEntity(siteId, { kindOverride: "site", nextView: "site" });
  };

  const handleEntitySelect = async (entityId: string) => {
    const entity = await MockDataService.getEntityById(entityId);
    const nextView =
      entity?.kind === "rack" || entity?.kind === "device"
        ? "rack"
        : entity?.kind === "site" || entity?.kind === "room" || entity?.kind === "row"
          ? "site"
          : "global";
    await selectEntity(entityId, { nextView });
  };

  const handleSearchResultSelect = async (result: RackVisionSearchResult) => {
    const nextView =
      result.kind === "rack" || result.kind === "device"
        ? "rack"
        : result.kind === "site" || result.kind === "room" || result.kind === "row"
          ? "site"
          : "global";
    await selectEntity(result.id, { kindOverride: result.kind, nextView });
    dispatch({ type: "CLOSE_SEARCH_RESULTS" });
    dispatch({ type: "SET_GLOBAL_SEARCH_QUERY", payload: result.name });
    if (result.kind === "rack") {
      dispatch({ type: "OPEN_RACK_PREVIEW", payload: result.id });
    }
    if (result.kind === "device") {
      const context = await MockDataService.getEntityContext(result.id);
      const rackId = context?.rackId;
      if (rackId) dispatch({ type: "OPEN_RACK_PREVIEW", payload: rackId });
    }
  };

  const handleOpenDevice = async (deviceId: string) => {
    const context = await selectEntity(deviceId, { kindOverride: "device", nextView: "rack" });
    toast({ title: "Open System Details", description: "Navigating to system details placeholder." });
    const backRoute = context?.rackId ? `/dashboard/rackvision/rack/${context.rackId}` : "/dashboard/rackvision";
    navigate(`/systems/${deviceId}?back=${encodeURIComponent(backRoute)}&entityId=${context?.entity.id ?? ""}`);
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
      dispatch({ type: "SET_SELECTED_DEVICE", payload: null });
      dispatch({ type: "SET_ACTIVE_RACK", payload: null });
      dispatch({ type: "SET_LAYOUT_CONTEXT", payload: { siteId: null, roomId: null } });
      dispatch({ type: "SET_ACTIVE_VIEW", payload: "global" });
      dispatch({ type: "CLOSE_RACK_PREVIEW" });
      dispatch({ type: "SET_BREADCRUMBS", payload: [{ id: "global", label: "Global", kind: "global" }] });
      setSites(allSites);
      navigate("/dashboard/rackvision");
      return;
    }
    const crumb = state.breadcrumbs.find((item) => item.id === id);
    const nextView =
      crumb?.kind === "rack" || crumb?.kind === "device"
        ? "rack"
        : crumb?.kind === "site" || crumb?.kind === "room" || crumb?.kind === "row"
          ? "site"
          : "global";
    await selectEntity(id, { kindOverride: crumb?.kind ?? null, nextView });
  };

  const handleOpenRack = async (rackId: string) => {
    dispatch({ type: "OPEN_RACK_PREVIEW", payload: rackId });
    await selectEntity(rackId, { kindOverride: "rack", nextView: "rack" });
  };

  const renderCenter = () => {
    if (state.activeView === "layout") {
      return (
        <LayoutViewCanvas
          selectedEntityId={state.selectedEntityId}
          selectedEntityKind={state.selectedEntityKind}
          selectedSiteId={selectedSiteId}
          selectedRoomId={state.selectedRoomId}
          selectedRackId={state.selectedRackId}
          onSelectEntity={handleEntitySelect}
          onOpenRack={handleOpenRack}
        />
      );
    }

    if (state.activeView === "site") {
      return (
        <SiteOverviewCanvas
          selectedEntityId={state.selectedEntityId}
          selectedEntityKind={state.selectedEntityKind}
          selectedRegionId={selectedRegionId}
          selectedSiteId={selectedSiteId}
          selectedEntityName={selectedEntityName}
          onSelectEntity={handleEntitySelect}
          onOpenRack={handleOpenRack}
          onOpenDevice={handleOpenDevice}
        />
      );
    }

    if (state.activeView === "rack") {
      const hasRackContext = Boolean(state.selectedRackId || state.rackPreviewRackId || state.selectedEntityKind === "rack" || state.selectedEntityKind === "device");
      if (!hasRackContext) {
        return <RouteFallbackState title="Rack View needs a selected rack" description="Select any rack from hierarchy, search, site cards, or layout tiles to continue." />;
      }
      return (
        <SiteOverviewCanvas
          selectedEntityId={state.selectedEntityId}
          selectedEntityKind={state.selectedEntityKind}
          selectedRegionId={selectedRegionId}
          selectedSiteId={selectedSiteId}
          selectedEntityName={selectedEntityName}
          onSelectEntity={handleEntitySelect}
          onOpenRack={handleOpenRack}
          onOpenDevice={handleOpenDevice}
        />
      );
    }

    if (state.activeView === "hierarchy") {
      return (
        <RouteFallbackState
          title="Hierarchy focus mode"
          description="Use the left panel to navigate entities; inspector and breadcrumbs remain fully synchronized while canvas stays low-noise."
        />
      );
    }

    return (
      <GlobalInfrastructureView
        forceGlobalView
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
    );
  };

  return (
    <section className="space-y-4">
      <RackVisionHeader
        searchQuery={state.globalSearchQuery}
        searchResults={state.globalSearchResults}
        isSearchOpen={state.isSearchResultsOpen}
        onSearchOpenChange={(open) => dispatch({ type: open ? "OPEN_SEARCH_RESULTS" : "CLOSE_SEARCH_RESULTS" })}
        onSearchQueryChange={(value) => {
          dispatch({ type: "SET_GLOBAL_SEARCH_QUERY", payload: value });
          if (!state.isSearchResultsOpen) dispatch({ type: "OPEN_SEARCH_RESULTS" });
          dispatch({ type: "SET_TREE_SEARCH", payload: value });
          handleSearch(value);
        }}
        onSearchResultSelect={handleSearchResultSelect}
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

      <RackVisionViewModeSwitcher />
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
          {renderCenter()}
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
