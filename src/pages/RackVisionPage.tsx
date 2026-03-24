import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbBar } from "@/components/rackvision/BreadcrumbBar";
import { FilterBarPlaceholder } from "@/components/rackvision/FilterBarPlaceholder";
import { GlobalInfrastructureView } from "@/components/rackvision/GlobalInfrastructureView";
import { HierarchyFocusCanvas } from "@/components/rackvision/HierarchyFocusCanvas";
import { HierarchyPanel } from "@/components/rackvision/HierarchyPanel";
import { InspectorPanel } from "@/components/rackvision/InspectorPanel";
import { InvestigationHistoryBar } from "@/components/rackvision/InvestigationHistoryBar";
import { LayoutViewCanvas } from "@/components/rackvision/LayoutViewCanvas";
import { RackVisionHeader } from "@/components/rackvision/RackVisionHeader";
import { RackVisionViewModeSwitcher } from "@/components/rackvision/RackVisionViewModeSwitcher";
import { RackVisionProvider, useRackVision } from "@/components/rackvision/RackVisionContext";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { SiteOverviewCanvas } from "@/components/rackvision/SiteOverviewCanvas";
import { InspectorSummary } from "@/components/rackvision/inspector-types";
import {
  DEFAULT_ACTIVE_FILTERS,
  GlobeRendererMode,
  GlobalSummary,
  GlobeMarker,
  HierarchyNode,
  InvestigationHistoryEntry,
  RackVisionFilterPresetId,
  RackVisionEntityKind,
  RACKVISION_FILTER_PRESETS,
  RackVisionSearchResult,
  RackVisionViewMode,
  RackVisionSelectionContext,
  Region,
  RegionSummary,
  SiteSummary,
} from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { OperationsMockService, RackOpsMetric, SiteOpsMetric } from "@/services/ops/OperationsMockService";
import { toast } from "@/hooks/use-toast";
import { MockDataService } from "@/services/rackvision/MockDataService";

const HISTORY_STORAGE_KEY = "rackvision.investigation-history";

function isPresetId(value: string | null): value is RackVisionFilterPresetId {
  return value === "custom" || value === "critical-sites" || value === "high-temp-racks" || value === "offline-devices";
}

function isViewMode(value: string | null): value is RackVisionViewMode {
  return value === "global" || value === "hierarchy" || value === "site" || value === "rack" || value === "layout" || value === "split";
}

function isRendererMode(value: string | null): value is GlobeRendererMode {
  return value === "three" || value === "mapbox";
}

function buildHistoryEntry(entry: {
  entityId: string | null;
  label: string;
  kind: RackVisionEntityKind | "global";
  route: string;
  view: RackVisionViewMode;
}): InvestigationHistoryEntry {
  return {
    id: `${Date.now()}-${entry.entityId ?? "global"}`,
    entityId: entry.entityId,
    label: entry.label,
    kind: entry.kind,
    route: entry.route,
    view: entry.view,
    timestamp: new Date().toISOString(),
  };
}

function getViewForEntityKind(kind: RackVisionEntityKind | null | undefined): RackVisionViewMode {
  if (kind === "rack" || kind === "device") return "rack";
  if (kind === "site" || kind === "room" || kind === "row") return "site";
  return "global";
}

function getInitialRouteView(params: { rackParam?: string; siteParam?: string }): RackVisionViewMode {
  if (params.rackParam) return "rack";
  if (params.siteParam) return "site";
  return "global";
}

function canKeepCurrentView(view: RackVisionViewMode, kind: RackVisionEntityKind | null | undefined): boolean {
  if (view === "hierarchy" || view === "global" || view === "site") {
    return true;
  }

  if (view === "layout") {
    return kind !== "region" && kind !== null;
  }

  if (view === "rack") {
    return kind === "rack" || kind === "device";
  }

  return false;
}

function getViewForSelection(currentView: RackVisionViewMode, kind: RackVisionEntityKind | null | undefined): RackVisionViewMode {
  if (canKeepCurrentView(currentView, kind)) {
    return currentView;
  }

  return getViewForEntityKind(kind);
}

function getRouteForSelection(context: RackVisionSelectionContext, kind: RackVisionEntityKind | null) {
  if (kind === "region" && context.regionId) return `/dashboard/rackvision/region/${context.regionId}`;
  if ((kind === "site" || kind === "room" || kind === "row") && context.siteId) return `/dashboard/rackvision/site/${context.siteId}`;
  if ((kind === "rack" || kind === "device") && context.rackId) return `/dashboard/rackvision/rack/${context.rackId}`;
  return "/dashboard/rackvision";
}

function RackVisionWorkspace() {
  const { state, dispatch } = useRackVision();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { regionId: regionParam, siteId: siteParam, rackId: rackParam } = useParams();
  const pendingRouteViewRef = useRef<RackVisionViewMode | null>(null);
  const didHydrateQueryRef = useRef(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);
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
  const [siteOps, setSiteOps] = useState<SiteOpsMetric | null>(null);
  const [rackOps, setRackOps] = useState<RackOpsMetric | null>(null);

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
  const currentRackVisionSearch = location.search;
  const applyPersistedQueryState = useCallback((params: URLSearchParams) => {
    const nextFilters = {
      ...DEFAULT_ACTIVE_FILTERS,
      status: (params.get("status") as typeof DEFAULT_ACTIVE_FILTERS.status | null) ?? DEFAULT_ACTIVE_FILTERS.status,
      deviceType: (params.get("deviceType") as typeof DEFAULT_ACTIVE_FILTERS.deviceType | null) ?? DEFAULT_ACTIVE_FILTERS.deviceType,
      criticalOnly: params.get("criticalOnly") === "true",
      offlineOnly: params.get("offlineOnly") === "true",
    };

    dispatch({ type: "SET_ACTIVE_FILTERS", payload: nextFilters });
    dispatch({ type: "SET_HIGHLIGHT_CRITICAL_ONLY", payload: nextFilters.criticalOnly });

    const presetId = params.get("preset");
    if (isPresetId(presetId)) {
      const preset = RACKVISION_FILTER_PRESETS.find((item) => item.id === presetId);
      if (preset) {
        dispatch({ type: "SET_ACTIVE_FILTERS", payload: { ...preset.filters, ...nextFilters } });
        dispatch({ type: "SET_HIGHLIGHT_CRITICAL_ONLY", payload: nextFilters.criticalOnly || preset.filters.criticalOnly });
      }
      dispatch({ type: "SET_FILTER_PRESET", payload: presetId });
    }

    const view = params.get("view");
    if (isViewMode(view)) {
      pendingRouteViewRef.current = view;
      dispatch({ type: "SET_ACTIVE_VIEW", payload: view });
    }

    const mode = params.get("mode");
    if (mode === "regions" || mode === "sites") {
      dispatch({ type: "SET_GLOBAL_VIEW_MODE", payload: mode });
    }

    const renderer = params.get("renderer");
    if (isRendererMode(renderer)) {
      dispatch({ type: "SET_GLOBE_RENDERER", payload: renderer });
    }
  }, [dispatch]);

  const exportCurrentSnapshot = useCallback(async () => {
    const snapshot = await OperationsMockService.exportScopeSnapshot({
      entityId: state.selectedEntityId ?? undefined,
      siteId: selectedSiteId ?? undefined,
      rackId: state.selectedRackId ?? undefined,
      deviceId: state.selectedDeviceId ?? undefined,
    });

    try {
      await navigator.clipboard.writeText(snapshot);
      toast({ title: "Snapshot copied", description: "RackVision context was copied to your clipboard as JSON." });
    } catch {
      const blob = new Blob([snapshot], { type: "application/json" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "rackvision-snapshot.json";
      link.click();
      window.URL.revokeObjectURL(objectUrl);
      toast({ title: "Snapshot downloaded", description: "RackVision context was exported as a JSON file." });
    }
  }, [selectedSiteId, state.selectedDeviceId, state.selectedEntityId, state.selectedRackId]);

  const refreshData = useCallback(async () => {
    const summary = await OperationsMockService.simulateLiveTick();
    setRefreshVersion((value) => value + 1);
    toast({
      title: "RackVision refreshed",
      description: `${summary.openAlerts} open alerts tracked across ${summary.activityCount} recent activity items.`,
    });
  }, []);

  const pushInvestigationHistory = useCallback((entry: InvestigationHistoryEntry) => {
    dispatch({ type: "PUSH_INVESTIGATION_HISTORY", payload: entry });
  }, [dispatch]);

  const setSiteOptionsForContext = useCallback(async (context: RackVisionSelectionContext, fallbackSites = allSites) => {
    if (context.regionId) {
      const regionSites = await MockDataService.getSitesByRegion(context.regionId);
      setSites(regionSites.map((site) => ({ id: site.id, name: site.name })));
      return;
    }
    setSites(fallbackSites);
  }, [allSites]);

  const clearSelectionState = useCallback((nextView: RackVisionViewMode) => {
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
    dispatch({ type: "SET_ACTIVE_VIEW", payload: nextView });
    dispatch({ type: "CLOSE_RACK_PREVIEW" });
    dispatch({ type: "SET_BREADCRUMBS", payload: [{ id: "global", label: "Global", kind: "global" }] });
    setSites(allSites);
  }, [allSites, dispatch]);

  const selectEntity = useCallback(async (
    id: string | null,
    options?: { kindOverride?: RackVisionEntityKind | null; updateRoute?: boolean; nextView?: RackVisionViewMode; fallbackSites?: { id: string; name: string }[] },
  ) => {
    if (!id) return null;
    const context = await MockDataService.getEntityContext(id);
    if (!context) {
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
    const route = getRouteForSelection(context, kind);
    pushInvestigationHistory(
      buildHistoryEntry({
        entityId: id,
        label: context.entity.name,
        kind,
        route: `${route}${currentRackVisionSearch}`,
        view: options?.nextView ?? state.activeView,
      }),
    );
    if (options?.updateRoute !== false) {
      pendingRouteViewRef.current = options?.nextView ?? null;
      navigate(`${route}${currentRackVisionSearch}`, { preventScrollReset: true });
    }
    return context;
  }, [currentRackVisionSearch, dispatch, navigate, pushInvestigationHistory, setSiteOptionsForContext, state.activeView]);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
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
      setInitialLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (didHydrateQueryRef.current) {
      return;
    }

    didHydrateQueryRef.current = true;

    applyPersistedQueryState(searchParams);

    try {
      const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as InvestigationHistoryEntry[];
        dispatch({ type: "SET_INVESTIGATION_HISTORY", payload: parsed });
      }
    } catch {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, [applyPersistedQueryState, dispatch, searchParams]);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state.investigationHistory));
  }, [state.investigationHistory]);

  useEffect(() => {
    if (!didHydrateQueryRef.current) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set("view", state.activeView);
    next.set("mode", state.globalViewMode);
    next.set("renderer", state.globeRenderer);
    next.set("preset", state.activeFilterPresetId);

    if (state.activeFilters.status === "all") next.delete("status");
    else next.set("status", state.activeFilters.status);

    if (state.activeFilters.deviceType === "all") next.delete("deviceType");
    else next.set("deviceType", state.activeFilters.deviceType);

    if (state.activeFilters.criticalOnly) next.set("criticalOnly", "true");
    else next.delete("criticalOnly");

    if (state.activeFilters.offlineOnly) next.set("offlineOnly", "true");
    else next.delete("offlineOnly");

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [
    searchParams,
    setSearchParams,
    state.activeFilterPresetId,
    state.activeFilters.criticalOnly,
    state.activeFilters.deviceType,
    state.activeFilters.offlineOnly,
    state.activeFilters.status,
    state.activeView,
    state.globeRenderer,
    state.globalViewMode,
  ]);

  useEffect(() => {
    if (initialLoading) {
      return;
    }

    const syncRouteSelection = async () => {
      const pendingView = pendingRouteViewRef.current;

      if (routeEntityId) {
        if (routeEntityId === state.selectedEntityId) {
          if (pendingView) {
            dispatch({ type: "SET_ACTIVE_VIEW", payload: pendingView });
          }
          pendingRouteViewRef.current = null;
          return;
        }

        const routeView = pendingView ?? getInitialRouteView({ rackParam, siteParam });
        pendingRouteViewRef.current = null;
        await selectEntity(routeEntityId, {
          updateRoute: false,
          nextView: routeView,
          fallbackSites: allSites,
        });
        return;
      }

      const nextView = pendingView ?? (state.activeView === "hierarchy" ? "hierarchy" : "global");
      pendingRouteViewRef.current = null;

      if (!state.selectedEntityId) {
        if (pendingView) {
          dispatch({ type: "SET_ACTIVE_VIEW", payload: nextView });
        }
        return;
      }

      clearSelectionState(nextView);
    };

    syncRouteSelection();
  }, [allSites, clearSelectionState, dispatch, initialLoading, rackParam, routeEntityId, selectEntity, siteParam, state.activeView, state.selectedEntityId]);

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
        if (state.activeFilters.alertSeverity === "warning" && marker.metrics.activeAlerts === 0) return false;
        if (state.activeFilters.alertSeverity === "critical" && marker.healthStatus !== "Critical") return false;
        const occupancy = marker.metrics.occupancyPercent ?? 0;
        if (state.activeFilters.occupancyRange === "low" && occupancy >= 50) return false;
        if (state.activeFilters.occupancyRange === "medium" && (occupancy < 50 || occupancy > 79)) return false;
        if (state.activeFilters.occupancyRange === "high" && occupancy < 80) return false;
        return true;
      });
      setMarkers(visible);
      setGlobalLoading(false);
    };
    loadGlobal();
  }, [
    selectedRegionId,
    state.activeFilters.alertSeverity,
    state.activeFilters.criticalOnly,
    state.activeFilters.offlineOnly,
    state.activeFilters.occupancyRange,
    state.activeFilters.status,
    state.globalViewMode,
  ]);

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

  useEffect(() => {
    const loadOps = async () => {
      if (selectedSiteId) setSiteOps(await OperationsMockService.getSiteMetric(selectedSiteId));
      else setSiteOps(null);

      if (state.selectedRackId) setRackOps(await OperationsMockService.getRackMetric(state.selectedRackId));
      else setRackOps(null);
    };
    loadOps();
  }, [refreshVersion, selectedSiteId, state.selectedRackId]);

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
    await selectEntity(regionId, { kindOverride: "region", nextView: getViewForSelection(state.activeView, "region") });
  };

  const handleSiteChange = async (siteId: string) => {
    await selectEntity(siteId, { kindOverride: "site", nextView: getViewForSelection(state.activeView, "site") });
  };

  const handleEntitySelect = async (entityId: string) => {
    const entity = await MockDataService.getEntityById(entityId);
    const nextView = getViewForSelection(state.activeView, entity?.kind);
    await selectEntity(entityId, { nextView });
  };

  const handleSearchResultSelect = async (result: RackVisionSearchResult) => {
    const nextView = getViewForEntityKind(result.kind);
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
    const backRoute = context?.rackId ? `/dashboard/rackvision/rack/${context.rackId}${currentRackVisionSearch}` : `/dashboard/rackvision${currentRackVisionSearch}`;
    navigate(`/systems/${deviceId}?back=${encodeURIComponent(backRoute)}&entityId=${context?.entity.id ?? ""}`);
  };

  const handleBreadcrumbSelect = async (id: string) => {
    if (id === "global") {
      const nextView = state.activeView === "hierarchy" ? "hierarchy" : "global";
      clearSelectionState(nextView);
      pushInvestigationHistory(
        buildHistoryEntry({
          entityId: null,
          label: "Global",
          kind: "global",
          route: `/dashboard/rackvision${currentRackVisionSearch}`,
          view: nextView,
        }),
      );
      pendingRouteViewRef.current = nextView;
      navigate(`/dashboard/rackvision${currentRackVisionSearch}`, { preventScrollReset: true });
      return;
    }
    const crumb = state.breadcrumbs.find((item) => item.id === id);
    const nextView = getViewForSelection(state.activeView, crumb?.kind ?? null);
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
        <HierarchyFocusCanvas
          nodes={tree}
          selectedEntityId={state.selectedEntityId}
          onSelectEntity={handleEntitySelect}
          onOpenDevice={handleOpenDevice}
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
        globeRenderer={state.globeRenderer}
        onGlobeRendererChange={(mode) => dispatch({ type: "SET_GLOBE_RENDERER", payload: mode })}
      />
    );
  };

  return (
    <>
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
          onRefresh={refreshData}
          onExport={exportCurrentSnapshot}
        />

        <RackVisionViewModeSwitcher />
        <FilterBarPlaceholder />
        <BreadcrumbBar onSelectBreadcrumb={handleBreadcrumbSelect} />
        <InvestigationHistoryBar
          history={state.investigationHistory}
          onSelect={(entry) => {
            const routeUrl = new URL(entry.route, window.location.origin);
            applyPersistedQueryState(routeUrl.searchParams);
            navigate(entry.route, { preventScrollReset: true });
          }}
          onClear={() => dispatch({ type: "CLEAR_INVESTIGATION_HISTORY" })}
        />

        {initialLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-[220px]" />
            <Skeleton className="h-[220px]" />
            <Skeleton className="h-[220px]" />
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <div className="order-2 xl:order-1">
              <HierarchyPanel nodes={tree} onSearch={handleSearch} onSelectEntity={handleEntitySelect} onOpenDevice={handleOpenDevice} />
            </div>
            <div className="order-1 min-h-[520px] sm:min-h-[640px] xl:order-2 xl:min-h-[720px]">{renderCenter()}</div>
            <div className="order-3">
              <InspectorPanel loading={inspectorLoading} summary={inspectorSummary} />
            </div>
          </div>
        )}

        {(siteOps || rackOps) && (
          <div className="grid gap-3 xl:grid-cols-2">
            {siteOps && (
              <WidgetCard title="Site Operations Depth">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="font-medium">{siteOps.siteName}</span></p>
                  <p>Power {siteOps.powerLoadKw}kW · Headroom {siteOps.powerHeadroomKw}kW</p>
                  <p>Cooling {siteOps.coolingHealth}% · Occupancy {siteOps.occupancy}%</p>
                  <p>Critical devices {siteOps.criticalDevices} · Network {siteOps.networkHealth}%</p>
                  <p>Backup failures {siteOps.backupFailures}</p>
                  <p>Patch compliance {siteOps.patchCompliance}%</p>
                </div>
              </WidgetCard>
            )}

            {rackOps && (
              <WidgetCard title="Rack Operations Depth">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="font-medium">{rackOps.rackName}</span></p>
                  <p>Used U {rackOps.usedU} · Free U {rackOps.freeU}</p>
                  <p>Power draw {rackOps.powerDrawKw}kW</p>
                  <p>Temperature {rackOps.temperatureC}°C · Hotspot {rackOps.hotspotRisk}</p>
                  <p>Device density {rackOps.deviceDensity}%</p>
                  <p>Alert concentration {rackOps.alertConcentration}%</p>
                </div>
              </WidgetCard>
            )}
          </div>
        )}
      </section>
      <Outlet />
    </>
  );
}

export default function RackVisionPage() {
  return (
    <RackVisionProvider>
      <RackVisionWorkspace />
    </RackVisionProvider>
  );
}
