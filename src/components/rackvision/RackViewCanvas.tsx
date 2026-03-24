import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { RackEmptyState } from "@/components/rackvision/RackEmptyState";
import { RackElevation } from "@/components/rackvision/RackElevation";
import { RackHeader } from "@/components/rackvision/RackHeader";
import { RackLegend } from "@/components/rackvision/RackLegend";
import { RackLoadingSkeleton } from "@/components/rackvision/RackLoadingSkeleton";
import { RackOperationsPanel } from "@/components/rackvision/RackOperationsPanel";
import { RackSummaryStrip } from "@/components/rackvision/RackSummaryStrip";
import { RackToolbar } from "@/components/rackvision/RackToolbar";
import { RackSummary, RackViewModel } from "@/components/rackvision/types";
import { MockDataService } from "@/services/rackvision/MockDataService";
import {
  DeviceOperationalSummary,
  OperationsMockService,
  RackOperationalSummary,
  RemoteAction,
} from "@/services/ops/OperationsMockService";

type RackViewCanvasProps = {
  rackId: string;
  siteName: string;
  racksInContext: RackSummary[];
  onSelectEntity: (id: string) => Promise<void>;
  onOpenDevice: (deviceId: string) => Promise<void>;
};

export function RackViewCanvas({ rackId, siteName, racksInContext, onSelectEntity, onOpenDevice }: RackViewCanvasProps) {
  const { state, dispatch } = useRackVision();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [switchingRack, setSwitchingRack] = useState(false);
  const [model, setModel] = useState<RackViewModel | null>(null);
  const [rackSummary, setRackSummary] = useState<RackOperationalSummary | null>(null);
  const [deviceSummary, setDeviceSummary] = useState<DeviceOperationalSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const activeRackId = state.activeRackId ?? rackId;

  useEffect(() => {
    dispatch({ type: "SET_ACTIVE_RACK", payload: rackId });
  }, [dispatch, rackId]);

  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      setLoading(true);
      const vm = await MockDataService.getRackViewModel(
        activeRackId,
        state.rackDeviceFilter,
        state.rackDeviceSearchQuery,
        state.highlightCriticalOnly,
      );

      if (cancelled) {
        return;
      }

      setModel(vm);
      setLoading(false);
    };

    void loadModel();

    return () => {
      cancelled = true;
    };
  }, [activeRackId, state.rackDeviceFilter, state.rackDeviceSearchQuery, state.highlightCriticalOnly]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      const next = await OperationsMockService.getRackOperationalSummary(activeRackId);
      if (!cancelled) {
        setRackSummary(next);
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [activeRackId, refreshKey]);

  useEffect(() => {
    let cancelled = false;

    const loadDeviceSummary = async () => {
      if (!state.selectedDeviceId) {
        setDeviceSummary(null);
        return;
      }

      const next = await OperationsMockService.getDeviceOperationalSummary(state.selectedDeviceId);
      if (!cancelled) {
        setDeviceSummary(next);
      }
    };

    void loadDeviceSummary();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, state.selectedDeviceId]);

  const rackOptions = useMemo(() => racksInContext, [racksInContext]);

  const handleSwitchRack = async (nextRackId: string) => {
    setSwitchingRack(true);
    dispatch({ type: "SET_ACTIVE_RACK", payload: nextRackId });
    dispatch({ type: "SET_SELECTED_RACK", payload: nextRackId });
    dispatch({ type: "SET_SELECTED_DEVICE", payload: null });
    await onSelectEntity(nextRackId);
    toast({ title: "Rack switched", description: `Now viewing ${nextRackId}.` });
    setRefreshKey((value) => value + 1);
    setSwitchingRack(false);
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
    const targetDeviceId = state.selectedDeviceId ?? model?.devices[0]?.device.id ?? rackSummary?.impactedDevices[0]?.id ?? null;
    if (!targetDeviceId) {
      toast({ title: "No device selected", description: "Select a device in the rack to open system details." });
      return;
    }
    await onOpenDevice(targetDeviceId);
  };

  const handleViewAlerts = () => {
    navigate(`/dashboard/manage?rackId=${encodeURIComponent(activeRackId)}&siteId=${encodeURIComponent(model.rack.siteId)}&entityName=${encodeURIComponent(model.rack.name)}&source=RackVision`);
  };

  const handleRunChecks = async () => {
    setActiveAction("checks");
    try {
      const result = await OperationsMockService.runHealthCheck({ entityType: "rack", entityId: activeRackId });
      toast({ title: result.title, description: result.findings[0] ?? "Rack health checks completed." });
      setRefreshKey((value) => value + 1);
    } finally {
      setActiveAction(null);
    }
  };

  const handleMaintenance = async () => {
    setActiveAction("maintenance");
    try {
      const result = await OperationsMockService.setMaintenance({ entityType: "rack", entityId: activeRackId });
      toast({ title: "Rack maintenance", description: result.message });
      setRefreshKey((value) => value + 1);
    } finally {
      setActiveAction(null);
    }
  };

  const handleExport = async () => {
    setActiveAction("export");
    try {
      const payload = await OperationsMockService.exportScopeSnapshot({ rackId: activeRackId, deviceId: state.selectedDeviceId ?? undefined });
      try {
        await navigator.clipboard.writeText(payload);
        toast({ title: "Rack snapshot copied", description: `Snapshot for ${model?.rack.name ?? activeRackId} copied to clipboard.` });
      } catch {
        const blob = new Blob([payload], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeRackId}-rackvision-snapshot.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast({ title: "Rack snapshot downloaded", description: "A JSON export was generated for this rack scope." });
      }
    } finally {
      setActiveAction(null);
    }
  };

  const handleRemoteAction = async (action: string, targetDeviceId?: string) => {
    const resolvedTargetDeviceId = targetDeviceId ?? state.selectedDeviceId ?? model?.devices[0]?.device.id ?? null;
    if (!resolvedTargetDeviceId) {
      toast({ title: "No device selected", description: "Pick a device before running remote actions." });
      return;
    }

    const remoteAction = action === "Remote Access" ? "Open Remote Session" : action;
    setActiveAction(action);
    try {
      await OperationsMockService.runRemoteAction(resolvedTargetDeviceId, remoteAction as RemoteAction);
      toast({ title: `${remoteAction} queued`, description: `${model?.devices.find((item) => item.device.id === resolvedTargetDeviceId)?.device.name ?? resolvedTargetDeviceId} updated.` });
      setRefreshKey((value) => value + 1);
    } finally {
      setActiveAction(null);
    }
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
        onViewAlerts={handleViewAlerts}
        onMaintenance={handleMaintenance}
        onExport={handleExport}
      />

      <RackSummaryStrip model={model} />

      <RackOperationsPanel
        summary={rackSummary}
        deviceSummary={deviceSummary}
        selectedDeviceId={state.selectedDeviceId}
        onViewAlerts={handleViewAlerts}
        onRunChecks={handleRunChecks}
        onMaintenance={handleMaintenance}
        onExport={handleExport}
        onRunRemoteAction={(action, deviceId) => handleRemoteAction(action, deviceId)}
      />

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

      {switchingRack ? <p className="text-xs text-muted-foreground">Switching rack context...</p> : null}
      {activeAction ? <p className="text-xs text-muted-foreground">Running {activeAction}...</p> : null}

      <RackLegend />
    </section>
  );
}
