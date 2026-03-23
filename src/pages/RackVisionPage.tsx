import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RackVisionHeader } from "@/components/rackvision/RackVisionHeader";
import { ViewModeSwitcher } from "@/components/rackvision/ViewModeSwitcher";
import { RegionSummaryCards } from "@/components/rackvision/RegionSummaryCards";
import { GlobalInfrastructureView } from "@/components/rackvision/GlobalInfrastructureView";
import { InfrastructureBreadcrumbs } from "@/components/rackvision/InfrastructureBreadcrumbs";
import { HierarchyExplorer } from "@/components/rackvision/HierarchyExplorer";
import { RackGrid } from "@/components/rackvision/RackGrid";
import { RackElevation } from "@/components/rackvision/RackElevation";
import { DetailsInspectorDrawer } from "@/components/rackvision/DetailsInspectorDrawer";
import { FilterToolbar } from "@/components/rackvision/FilterToolbar";
import { RackLegend } from "@/components/rackvision/RackLegend";
import { RackVisionViewMode } from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  infrastructureDevices,
  infrastructureRacks,
  infrastructureRegions,
  infrastructureRooms,
  infrastructureRows,
  infrastructureSites,
} from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function RackVisionPage() {
  const navigate = useNavigate();
  const { regionId: regionParam, siteId: siteParam, rackId: rackParam } = useParams();

  const [viewMode, setViewMode] = useState<RackVisionViewMode>("global");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedRegionId, setSelectedRegionId] = useState(regionParam ?? infrastructureRegions[0].id);
  const [selectedSiteId, setSelectedSiteId] = useState(siteParam ?? infrastructureSites[0].id);
  const [selectedRoomId, setSelectedRoomId] = useState(infrastructureRooms[0].id);
  const [selectedRowId, setSelectedRowId] = useState(infrastructureRows[0].id);
  const [selectedRackId, setSelectedRackId] = useState(rackParam ?? infrastructureRacks[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = useState(infrastructureDevices[0].id);

  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [chips, setChips] = useState({
    healthyOnly: false,
    warningCriticalOnly: false,
    offlineOnly: false,
    showEmptySlots: true,
    showNetworkDevices: true,
    showStorageDevices: true,
  });

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, [viewMode, selectedRegionId, selectedSiteId, selectedRackId]);

  useEffect(() => {
    if (regionParam) setSelectedRegionId(regionParam);
    if (siteParam) setSelectedSiteId(siteParam);
    if (rackParam) setSelectedRackId(rackParam);
  }, [rackParam, regionParam, siteParam]);

  const sitesByRegion = useMemo(
    () => infrastructureSites.filter((site) => site.regionId === selectedRegionId),
    [selectedRegionId],
  );

  const roomsBySite = useMemo(() => infrastructureRooms.filter((room) => room.siteId === selectedSiteId), [selectedSiteId]);
  const rowsByRoom = useMemo(() => infrastructureRows.filter((row) => row.roomId === selectedRoomId), [selectedRoomId]);
  const racksByRow = useMemo(() => infrastructureRacks.filter((rack) => rack.rowId === selectedRowId), [selectedRowId]);

  const filteredRacks = useMemo(
    () =>
      racksByRow.filter((rack) => {
        if (statusFilter !== "all" && rack.status !== statusFilter) return false;
        if (search && !rack.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [racksByRow, search, statusFilter],
  );

  const selectedRack = infrastructureRacks.find((rack) => rack.id === selectedRackId) ?? filteredRacks[0] ?? infrastructureRacks[0];

  const filteredDevices = useMemo(
    () =>
      infrastructureDevices.filter((device) => {
        if (device.rackId !== selectedRack.id) return false;
        if (statusFilter !== "all" && device.status !== statusFilter) return false;
        if (chips.healthyOnly && device.status !== "Healthy") return false;
        if (chips.warningCriticalOnly && !["Warning", "Critical"].includes(device.status)) return false;
        if (chips.offlineOnly && device.status !== "Offline") return false;
        if (!chips.showNetworkDevices && ["Top-of-Rack Switch", "Firewall"].includes(device.deviceType)) return false;
        if (!chips.showStorageDevices && device.deviceType === "Storage Unit") return false;
        if (deviceTypeFilter === "Server" && !device.deviceType.includes("Server")) return false;
        if (deviceTypeFilter === "Storage" && !device.deviceType.includes("Storage")) return false;
        if (deviceTypeFilter === "Switch" && !device.deviceType.includes("Switch")) return false;
        if (deviceTypeFilter === "Firewall" && !device.deviceType.includes("Firewall")) return false;
        if (
          search &&
          !`${device.hostname} ${device.systemId} ${selectedRack.name} ${device.ipAddress} ${selectedSiteId}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [chips, deviceTypeFilter, search, selectedRack.id, selectedRack.name, selectedSiteId, statusFilter],
  );

  const selectedRegion = infrastructureRegions.find((region) => region.id === selectedRegionId) ?? infrastructureRegions[0];
  const selectedSite = infrastructureSites.find((site) => site.id === selectedSiteId) ?? infrastructureSites[0];
  const selectedRoom = infrastructureRooms.find((room) => room.id === selectedRoomId);
  const selectedRow = infrastructureRows.find((row) => row.id === selectedRowId);
  const selectedDevice = filteredDevices.find((device) => device.id === selectedDeviceId) ?? filteredDevices[0];

  const summaryCards = [
    { label: "Total Regions", value: String(infrastructureRegions.length) },
    { label: "Total Sites", value: String(infrastructureSites.length) },
    { label: "Total Racks", value: String(infrastructureRacks.length) },
    { label: "Total Devices", value: String(infrastructureDevices.length) },
    {
      label: "Critical Alerts",
      value: String(infrastructureDevices.reduce((acc, device) => acc + (device.status === "Critical" ? device.alertsCount : 0), 0)),
    },
    {
      label: "Online vs Offline",
      value: `${infrastructureDevices.filter((device) => device.status !== "Offline").length}/${
        infrastructureDevices.filter((device) => device.status === "Offline").length
      }`,
    },
    { label: "Capacity Used", value: `${selectedRegion.capacityUsed}%` },
    { label: "Power / Thermal", value: `${selectedRegion.powerKw}kW • ${selectedRegion.thermalState}` },
  ];

  const breadcrumbCrumbs = [
    { label: "Global", onClick: () => setViewMode("global") },
    { label: selectedRegion.name, onClick: () => setViewMode("hierarchy") },
    { label: selectedSite.name, onClick: () => setViewMode("layout") },
    { label: selectedRack.name, onClick: () => setViewMode("rack") },
  ];

  const openSystem = () => {
    if (!selectedDevice) return;
    navigate(`/systems/${selectedDevice.systemId}`);
  };

  const toggleChip = (key: keyof typeof chips) => setChips((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="space-y-4">
      <RackVisionHeader
        search={search}
        onSearchChange={setSearch}
        regionId={selectedRegionId}
        siteId={selectedSiteId}
        statusFilter={statusFilter}
        deviceTypeFilter={deviceTypeFilter}
        regions={infrastructureRegions}
        sites={sitesByRegion}
        onRegionChange={(value) => {
          setSelectedRegionId(value);
          navigate(`/dashboard/rackvision/region/${value}`);
        }}
        onSiteChange={(value) => {
          setSelectedSiteId(value);
          navigate(`/dashboard/rackvision/site/${value}`);
        }}
        onStatusFilterChange={setStatusFilter}
        onDeviceTypeFilterChange={setDeviceTypeFilter}
        onRefresh={() => toast({ title: "RackVision refreshed", description: "Mock infrastructure snapshot updated." })}
        onExport={() => toast({ title: "Export started", description: "Snapshot export is a UI placeholder." })}
      />

      <ViewModeSwitcher value={viewMode} onValueChange={setViewMode} />
      <FilterToolbar {...chips} onToggle={toggleChip} />
      <InfrastructureBreadcrumbs crumbs={breadcrumbCrumbs} />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : (
        <>
          {viewMode === "global" && (
            <div className="space-y-4">
              <RegionSummaryCards items={summaryCards} />
              <GlobalInfrastructureView
                regions={infrastructureRegions}
                sites={infrastructureSites}
                selectedRegionId={selectedRegionId}
                onSelectRegion={(id) => {
                  setSelectedRegionId(id);
                  setViewMode("hierarchy");
                }}
              />
            </div>
          )}

          {(viewMode === "hierarchy" || viewMode === "split") && (
            <div className="grid gap-3 xl:grid-cols-[320px_1fr_340px]">
              <HierarchyExplorer
                regions={infrastructureRegions}
                sites={sitesByRegion}
                rooms={roomsBySite}
                rows={rowsByRoom}
                racks={filteredRacks}
                query={search}
                onQueryChange={setSearch}
                selectedRegionId={selectedRegionId}
                selectedSiteId={selectedSiteId}
                selectedRoomId={selectedRoomId}
                selectedRowId={selectedRowId}
                selectedRackId={selectedRack.id}
                onSelectRegion={setSelectedRegionId}
                onSelectSite={setSelectedSiteId}
                onSelectRoom={setSelectedRoomId}
                onSelectRow={setSelectedRowId}
                onSelectRack={(id) => {
                  setSelectedRackId(id);
                  setViewMode("rack");
                  navigate(`/dashboard/rackvision/rack/${id}`);
                }}
              />
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Site / Data Center Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Site: <span className="text-foreground">{selectedSite.name}</span></p>
                  <p>Region: <span className="text-foreground">{selectedRegion.name}</span></p>
                  <p>Racks: <span className="text-foreground">{selectedSite.racksCount}</span></p>
                  <p>Devices: <span className="text-foreground">{selectedSite.devicesCount}</span></p>
                  <p>Occupancy: <span className="text-foreground">{selectedSite.occupancy}%</span></p>
                  <p>Health Score: <span className="text-foreground">{selectedSite.healthScore}</span></p>
                  <p>Avg Temp: <span className="text-foreground">{selectedSite.avgTemperature}°C</span></p>
                  <p>Power Utilization: <span className="text-foreground">{selectedSite.powerUtilization}%</span></p>
                </CardContent>
              </Card>
              <DetailsInspectorDrawer
                region={selectedRegion}
                site={selectedSite}
                room={selectedRoom}
                row={selectedRow}
                rack={selectedRack}
                device={selectedDevice}
                onOpenSystem={openSystem}
                onMockAction={(action) => toast({ title: action, description: "Mock action only — no backend execution." })}
              />
            </div>
          )}

          {(viewMode === "rack" || viewMode === "split") && (
            <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
              <div className="space-y-3">
                <RackGrid
                  racks={filteredRacks.length ? filteredRacks : racksByRow}
                  selectedRackId={selectedRack.id}
                  onSelectRack={(id) => {
                    setSelectedRackId(id);
                    navigate(`/dashboard/rackvision/rack/${id}`);
                  }}
                />
                <RackLegend />
                <RackElevation
                  rack={selectedRack}
                  devices={filteredDevices}
                  selectedDeviceId={selectedDevice?.id ?? ""}
                  onSelectDevice={setSelectedDeviceId}
                  onOpenSystem={(deviceId) => {
                    const target = infrastructureDevices.find((device) => device.id === deviceId);
                    if (target) navigate(`/systems/${target.systemId}`);
                  }}
                  showEmptySlots={chips.showEmptySlots}
                />
              </div>
              <DetailsInspectorDrawer
                region={selectedRegion}
                site={selectedSite}
                room={selectedRoom}
                row={selectedRow}
                rack={selectedRack}
                device={selectedDevice}
                onOpenSystem={openSystem}
                onMockAction={(action) => toast({ title: action, description: "Mock action only — no backend execution." })}
              />
            </div>
          )}

          {viewMode === "layout" && (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Layout View — Room / Row / Rack Topology</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {rowsByRoom.map((row) => (
                  <div key={row.id} className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.rackCount} racks • {row.criticalAlerts} critical alerts</p>
                    <div className="mt-2 space-y-1">
                      {infrastructureRacks
                        .filter((rack) => rack.rowId === row.id)
                        .map((rack) => (
                          <button
                            key={rack.id}
                            type="button"
                            className="w-full rounded border border-border bg-card px-2 py-1 text-left text-xs hover:border-primary"
                            onClick={() => {
                              setSelectedRackId(rack.id);
                              setViewMode("rack");
                            }}
                          >
                            {rack.name}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
