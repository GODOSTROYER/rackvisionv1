import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { NoRacksState } from "@/components/rackvision/NoRacksState";
import { RackFilterToolbar } from "@/components/rackvision/RackFilterToolbar";
import { RackGridPanel } from "@/components/rackvision/RackGridPanel";
import { RackSearchBar } from "@/components/rackvision/RackSearchBar";
import { RackSortControl } from "@/components/rackvision/RackSortControl";
import { RackViewCanvas } from "@/components/rackvision/RackViewCanvas";
import { RegionSitesPanel } from "@/components/rackvision/RegionSitesPanel";
import { RoomExplorer } from "@/components/rackvision/RoomExplorer";
import { RowExplorer } from "@/components/rackvision/RowExplorer";
import { SiteMetadataPanel } from "@/components/rackvision/SiteMetadataPanel";
import { SiteOverviewSkeleton } from "@/components/rackvision/SiteOverviewSkeleton";
import { SiteSummaryCards } from "@/components/rackvision/SiteSummaryCards";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { RackSummary, RackVisionEntityKind, RowSummary, SiteCardSummary, SiteOverview } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { MockDataService } from "@/services/rackvision/MockDataService";

type RackPreviewData = RackSummary & {
  devices: Array<{ id: string; name: string; deviceType: string; rackUnitStart: number }>;
  siteName: string;
};

type SiteOverviewCanvasProps = {
  selectedEntityId: string | null;
  selectedEntityKind: RackVisionEntityKind | null;
  selectedRegionId: string | null;
  selectedSiteId: string | null;
  selectedEntityName: string | null;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenRack: (rackId: string) => Promise<void>;
  onOpenDevice: (deviceId: string) => Promise<void>;
};

export function SiteOverviewCanvas({
  selectedEntityId,
  selectedEntityKind,
  selectedRegionId,
  selectedSiteId,
  selectedEntityName,
  onSelectEntity,
  onOpenRack,
  onOpenDevice,
}: SiteOverviewCanvasProps) {
  const { state, dispatch } = useRackVision();
  const [regionSites, setRegionSites] = useState<SiteCardSummary[]>([]);
  const [overview, setOverview] = useState<SiteOverview | null>(null);
  const [rows, setRows] = useState<RowSummary[]>([]);
  const [racks, setRacks] = useState<RackSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const regionMode = selectedEntityKind === "region" && selectedEntityId;
  const siteContextId = useMemo(() => {
    if (selectedEntityKind === "site" && selectedEntityId) return selectedEntityId;
    if (selectedSiteId) return selectedSiteId;
    return null;
  }, [selectedEntityId, selectedEntityKind, selectedSiteId]);

  useEffect(() => {
    if (!regionMode) {
      setRegionSites([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      const cards = await MockDataService.getRegionSites(regionMode);
      setRegionSites(cards);
      setLoading(false);
    };
    load();
  }, [regionMode]);

  useEffect(() => {
    if (!siteContextId) {
      setOverview(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      const data = await MockDataService.getSiteOverview(siteContextId);
      setOverview(data);
      setLoading(false);
    };
    load();
  }, [siteContextId]);

  useEffect(() => {
    if (!siteContextId) {
      setRows([]);
      return;
    }
    const load = async () => {
      const nextRows = state.selectedRoomId
        ? await MockDataService.getRoomRows(state.selectedRoomId)
        : await MockDataService.getRowsForSite(siteContextId);
      const filteredRows = nextRows.filter((row) => {
        if (state.activeFilters.status !== "all" && row.healthStatus !== state.activeFilters.status) return false;
        if (state.activeFilters.criticalOnly && row.healthStatus !== "Critical") return false;
        if (state.activeFilters.offlineOnly && row.healthStatus !== "Offline") return false;
        return true;
      });
      setRows(filteredRows);
    };
    load();
  }, [siteContextId, state.activeFilters.criticalOnly, state.activeFilters.offlineOnly, state.activeFilters.status, state.selectedRoomId]);

  useEffect(() => {
    if (!siteContextId) {
      setRacks([]);
      return;
    }
    const load = async () => {
      const mergedFilters = {
        ...state.rackFilters,
        status: state.activeFilters.status,
        occupancy: state.activeFilters.occupancyRange,
        alertLevel:
          state.activeFilters.alertSeverity === "critical"
            ? "critical_only"
            : state.activeFilters.alertSeverity === "warning"
              ? "warning_critical"
              : "all",
        roomId: state.selectedRoomId ?? state.rackFilters.roomId,
        rowId: state.selectedRowId ?? state.rackFilters.rowId,
      } as const;
      const nextRacks = await MockDataService.getRacksForSite(siteContextId, mergedFilters, state.rackSortBy, state.rackSearchQuery);
      const filteredRacks = nextRacks.filter((rack) => {
        if (state.activeFilters.criticalOnly && rack.healthStatus !== "Critical") return false;
        if (state.activeFilters.offlineOnly && rack.healthStatus !== "Offline") return false;
        return true;
      });
      setRacks(filteredRacks);
    };
    load();
  }, [
    siteContextId,
    state.activeFilters.alertSeverity,
    state.activeFilters.criticalOnly,
    state.activeFilters.offlineOnly,
    state.activeFilters.occupancyRange,
    state.activeFilters.status,
    state.rackFilters,
    state.rackSearchQuery,
    state.rackSortBy,
    state.selectedRoomId,
    state.selectedRowId,
  ]);

  const rackViewRackId = state.rackPreviewRackId ?? state.selectedRackId ?? (selectedEntityKind === "rack" ? selectedEntityId : null);

  if (rackViewRackId) {
    return (
      <RackViewCanvas
        rackId={rackViewRackId}
        siteName={overview?.site.name ?? "Site"}
        racksInContext={racks}
        onSelectEntity={onSelectEntity}
        onOpenDevice={onOpenDevice}
      />
    );
  }

  if (loading && !overview && !regionSites.length) return <SiteOverviewSkeleton />;

  if (regionMode && !siteContextId) {
    return (
      <section className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{selectedEntityName ?? "Region"} overview</p>
          <p>Select a site to open the Site / Data Center operational view.</p>
        </div>
        <RegionSitesPanel sites={regionSites} onSelectSite={onSelectEntity} />
      </section>
    );
  }

  if (!overview) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a site, room, row, or rack to load the Site Overview.</p>
      </div>
    );
  }

  const handleSelectRoom = async (roomId: string) => {
    dispatch({ type: "SET_SELECTED_ROOM", payload: roomId });
    dispatch({ type: "SET_SELECTED_ROW", payload: null });
    dispatch({ type: "SET_RACK_FILTERS", payload: { ...state.rackFilters, roomId, rowId: "all" } });
    await onSelectEntity(roomId);
  };

  const handleSelectRow = async (rowId: string) => {
    dispatch({ type: "SET_SELECTED_ROW", payload: rowId });
    dispatch({ type: "SET_RACK_FILTERS", payload: { ...state.rackFilters, rowId } });
    await onSelectEntity(rowId);
  };

  const handleSelectRack = async (rackId: string) => {
    dispatch({ type: "SET_SELECTED_RACK", payload: rackId });
    await onSelectEntity(rackId);
  };

  const handleOpenRack = async (rackId: string) => {
    dispatch({ type: "OPEN_RACK_PREVIEW", payload: rackId });
    await onOpenRack(rackId);
  };

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-foreground">{overview.site.name}</p>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {overview.site.city}, {overview.site.country} • {overview.regionName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={overview.site.healthStatus} />
            <Button size="sm" variant="outline">Snapshot</Button>
            <Button size="sm" variant="outline">Run Checks</Button>
          </div>
        </div>
      </div>

      <SiteSummaryCards summary={overview.summary} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <RoomExplorer rooms={overview.rooms} selectedRoomId={state.selectedRoomId} onSelectRoom={handleSelectRoom} />
          <RowExplorer rows={rows} selectedRowId={state.selectedRowId} onSelectRow={handleSelectRow} />
        </div>
        <SiteMetadataPanel overview={overview} />
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <RackSearchBar value={state.rackSearchQuery} onChange={(value) => dispatch({ type: "SET_RACK_SEARCH", payload: value })} />
          <RackSortControl value={state.rackSortBy} onChange={(value) => dispatch({ type: "SET_RACK_SORT", payload: value })} />
        </div>
        <RackFilterToolbar
          filters={state.rackFilters}
          rooms={overview.rooms}
          rows={rows}
          onChange={(filters) => {
            dispatch({ type: "SET_RACK_FILTERS", payload: filters });
            dispatch({ type: "SET_SELECTED_ROOM", payload: filters.roomId === "all" ? null : filters.roomId });
            dispatch({ type: "SET_SELECTED_ROW", payload: filters.rowId === "all" ? null : filters.rowId });
          }}
        />
      </div>

      {racks.length ? (
        <RackGridPanel racks={racks} selectedRackId={state.selectedRackId} onSelectRack={handleSelectRack} onOpenRack={handleOpenRack} />
      ) : (
        <NoRacksState />
      )}

      {selectedEntityKind === "room" || selectedEntityKind === "row" ? (
        <div className="rounded-md border border-border bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          <Building2 className="mr-1 inline h-3.5 w-3.5" /> Context scoped to {selectedEntityName}. Rack grid below is filtered accordingly.
        </div>
      ) : null}
    </section>
  );
}
