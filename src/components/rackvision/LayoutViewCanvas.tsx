import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BatteryCharging, Building2, Scale, Thermometer } from "lucide-react";
import { RoomLayoutPanel } from "@/components/rackvision/RoomLayoutPanel";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MockDataService } from "@/services/rackvision/MockDataService";
import { LayoutOverlayMode, LayoutViewModel, RackVisionEntityKind } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type LayoutViewCanvasProps = {
  selectedEntityId: string | null;
  selectedEntityKind: RackVisionEntityKind | null;
  selectedSiteId: string | null;
  selectedRoomId: string | null;
  selectedRackId: string | null;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenRack: (id: string) => Promise<void>;
};

export function LayoutViewCanvas({
  selectedEntityId,
  selectedEntityKind,
  selectedSiteId,
  selectedRoomId,
  selectedRackId,
  onSelectEntity,
  onOpenRack,
}: LayoutViewCanvasProps) {
  const { state, dispatch } = useRackVision();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<LayoutViewModel | null>(null);

  const scopeId = useMemo(() => {
    if (selectedEntityKind === "site" || selectedEntityKind === "room") return selectedEntityId;
    if (selectedRoomId) return selectedRoomId;
    if (selectedSiteId) return selectedSiteId;
    return null;
  }, [selectedEntityId, selectedEntityKind, selectedRoomId, selectedSiteId]);

  useEffect(() => {
    if (!scopeId) {
      setModel(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      setModel(await MockDataService.getLayoutViewModel(scopeId));
      setLoading(false);
    };
    load();
  }, [scopeId]);

  const overlayLegend = useMemo(() => {
    if (state.layoutOverlayMode === "occupancy") {
      return [
        { label: "Low", tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
        { label: "Medium", tone: "bg-amber-500/15 text-amber-700 border-amber-500/40" },
        { label: "High", tone: "bg-destructive/10 text-destructive border-destructive/40" },
      ];
    }

    if (state.layoutOverlayMode === "thermal") {
      return [
        { label: "Cool", tone: "bg-sky-500/15 text-sky-700 border-sky-500/40" },
        { label: "Warm", tone: "bg-amber-500/15 text-amber-700 border-amber-500/40" },
        { label: "Hot", tone: "bg-destructive/10 text-destructive border-destructive/40" },
      ];
    }

    if (state.layoutOverlayMode === "power") {
      return [
        { label: "Headroom", tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
        { label: "Normal", tone: "bg-muted/30 text-muted-foreground border-border" },
        { label: "Heavy", tone: "bg-destructive/10 text-destructive border-destructive/40" },
      ];
    }

    return [
      { label: "No alerts", tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
      { label: "Warning", tone: "bg-amber-500/15 text-amber-700 border-amber-500/40" },
      { label: "Critical", tone: "bg-destructive/10 text-destructive border-destructive/40" },
    ];
  }, [state.layoutOverlayMode]);

  const overlayIcon = state.layoutOverlayMode === "occupancy"
    ? Scale
    : state.layoutOverlayMode === "thermal"
      ? Thermometer
      : state.layoutOverlayMode === "power"
        ? BatteryCharging
        : AlertTriangle;
  const overlayLabel =
    state.layoutOverlayMode === "alerts"
      ? "Alerts"
      : state.layoutOverlayMode === "occupancy"
        ? "Occupancy"
        : state.layoutOverlayMode === "thermal"
          ? "Thermal"
          : "Power";

  if (!scopeId) {
    return <RouteFallbackState title="Layout View needs a site or room" description="Select a site or room from hierarchy or globe to render topology lanes." />;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }

  if (!model || !model.rooms.length) {
    return <RouteFallbackState title="No layout data" description="This scope has no room/row/rack topology in mock data." />;
  }

  return (
    <section className="space-y-3">
      <header className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="h-4 w-4" /> {model.siteName} Layout • {model.regionName}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["alerts", "occupancy", "thermal", "power"] as LayoutOverlayMode[]).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={state.layoutOverlayMode === mode ? "default" : "outline"}
                className="h-8"
                onClick={() => dispatch({ type: "SET_LAYOUT_OVERLAY_MODE", payload: mode })}
              >
                {mode === "alerts" ? "Alerts" : mode === "occupancy" ? "Occupancy" : mode === "thermal" ? "Thermal" : "Power"}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Top-down operational topology for rooms, rows, and racks. Click to inspect, double-click to open rack view.</p>
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground">
            {(() => {
              const Icon = overlayIcon;
              return <><Icon className="h-3.5 w-3.5" /> {overlayLabel}</>;
            })()}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {overlayLegend.map((item) => (
            <span key={item.label} className={cn("rounded-full border px-2 py-1 text-[10px] font-medium", item.tone)}>
              {item.label}
            </span>
          ))}
        </div>
      </header>
      <div className="space-y-3">
        {model.rooms.map((room) => (
          <RoomLayoutPanel
            key={room.roomId}
            room={room}
            overlayMode={state.layoutOverlayMode}
            selectedRowId={state.selectedRowId}
            selectedRackId={selectedRackId}
            onSelectRoom={(roomId) => onSelectEntity(roomId)}
            onSelectRow={(rowId) => onSelectEntity(rowId)}
            onSelectRack={(rackId) => onSelectEntity(rackId)}
            onOpenRack={onOpenRack}
          />
        ))}
      </div>
    </section>
  );
}
