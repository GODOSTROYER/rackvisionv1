import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { RackEmptyState } from "@/components/rackvision/RackEmptyState";
import { RackElevation } from "@/components/rackvision/RackElevation";
import { RackHeader } from "@/components/rackvision/RackHeader";
import { RackLegend } from "@/components/rackvision/RackLegend";
import { RackLoadingSkeleton } from "@/components/rackvision/RackLoadingSkeleton";
import { RackSummaryStrip } from "@/components/rackvision/RackSummaryStrip";
import { RackToolbar } from "@/components/rackvision/RackToolbar";
import { RackSummary, RackViewModel } from "@/components/rackvision/types";
import { MockDataService } from "@/services/rackvision/MockDataService";

type RackViewCanvasProps = {
  rackId: string;
  siteName: string;
  racksInContext: RackSummary[];
  onSelectEntity: (id: string) => Promise<void>;
  onOpenDevice: (deviceId: string) => Promise<void>;
};

export function RackViewCanvas({ rackId, siteName, racksInContext, onSelectEntity, onOpenDevice }: RackViewCanvasProps) {
  const { state, dispatch } = useRackVision();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<RackViewModel | null>(null);

  const activeRackId = state.activeRackId ?? rackId;

  const loadModel = async (targetRackId: string) => {
    setLoading(true);
    const vm = await MockDataService.getRackViewModel(
      targetRackId,
      state.rackDeviceFilter,
      state.rackDeviceSearchQuery,
      state.highlightCriticalOnly,
    );
    setModel(vm);
    setLoading(false);
  };

  useEffect(() => {
    dispatch({ type: "SET_ACTIVE_RACK", payload: rackId });
  }, [dispatch, rackId]);

  useEffect(() => {
    loadModel(activeRackId);
  }, [activeRackId, state.rackDeviceFilter, state.rackDeviceSearchQuery, state.highlightCriticalOnly]);

  const rackOptions = useMemo(() => racksInContext, [racksInContext]);

  const handleSwitchRack = async (nextRackId: string) => {
    dispatch({ type: "SET_ACTIVE_RACK", payload: nextRackId });
    dispatch({ type: "SET_SELECTED_RACK", payload: nextRackId });
    dispatch({ type: "SET_SELECTED_DEVICE", payload: null });
    await onSelectEntity(nextRackId);
  };

  const handleSelectDevice = async (deviceId: string) => {
    dispatch({ type: "SET_SELECTED_DEVICE", payload: deviceId });
    await onSelectEntity(deviceId);
  };

  if (loading) return <RackLoadingSkeleton />;
  if (!model) return <RackEmptyState />;

  const handlePrev = async () => {
    if (!model.previousRackId) return;
    await handleSwitchRack(model.previousRackId);
  };

  const handleNext = async () => {
    if (!model.nextRackId) return;
    await handleSwitchRack(model.nextRackId);
  };

  const handleOpenSystem = async () => {
    if (state.selectedDeviceId) {
      await onOpenDevice(state.selectedDeviceId);
      return;
    }
    toast({ title: "No device selected", description: "Select a device in the rack to open system details." });
  };

  const hasDevices = model.devices.length > 0;

  return (
    <section className="space-y-3">
      <RackHeader
        model={model}
        siteName={siteName}
        onPrevRack={handlePrev}
        onNextRack={handleNext}
        onOpenSystem={handleOpenSystem}
        onViewAlerts={() => toast({ title: "View Alerts", description: "Rack alerts panel is a UI placeholder for now." })}
        onMaintenance={() => toast({ title: "Maintenance Mode", description: "Maintenance mode action is simulated." })}
        onExport={() => toast({ title: "Export Snapshot", description: "Rack snapshot export is a UI-only action." })}
      />

      <RackSummaryStrip model={model} />

      <RackToolbar
        state={state}
        rackOptions={rackOptions}
        activeRackId={activeRackId}
        onSwitchRack={handleSwitchRack}
        onDeviceSearchChange={(value) => dispatch({ type: "SET_RACK_DEVICE_SEARCH", payload: value })}
        onShowEmptyUnitsChange={(value) => dispatch({ type: "SET_SHOW_EMPTY_UNITS", payload: value })}
        onHighlightCriticalChange={(value) => dispatch({ type: "SET_HIGHLIGHT_CRITICAL_ONLY", payload: value })}
        onDeviceFilterChange={(filter) => dispatch({ type: "SET_RACK_DEVICE_FILTER", payload: filter })}
      />

      {hasDevices ? (
        <RackElevation
          devices={model.devices}
          emptyUnits={model.emptyUnits}
          showEmptyUnits={state.showEmptyUnits}
          selectedDeviceId={state.selectedDeviceId}
          onSelectDevice={handleSelectDevice}
          onHoverDevice={(id) => dispatch({ type: "SET_HOVERED_DEVICE", payload: id })}
          onOpenSystem={onOpenDevice}
        />
      ) : (
        <RackEmptyState />
      )}

      <RackLegend />
    </section>
  );
}
