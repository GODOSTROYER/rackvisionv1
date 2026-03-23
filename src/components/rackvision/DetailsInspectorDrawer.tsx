import { InfraDevice, InfraRack, InfraRegion, InfraRoom, InfraRow, InfraSite } from "@/data/mockData";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsMiniBar } from "@/components/rackvision/MetricsMiniBar";
import { MiniTrendChart } from "@/components/rackvision/MiniTrendChart";

type DetailsInspectorDrawerProps = {
  region?: InfraRegion;
  site?: InfraSite;
  room?: InfraRoom;
  row?: InfraRow;
  rack?: InfraRack;
  device?: InfraDevice;
  onOpenSystem: () => void;
  onMockAction: (action: string) => void;
};

export function DetailsInspectorDrawer({ region, site, room, row, rack, device, onOpenSystem, onMockAction }: DetailsInspectorDrawerProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Details Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {device ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{device.hostname}</p>
              <StatusBadge status={device.status} />
            </div>
            <p className="text-muted-foreground">{device.deviceType} • {device.ipAddress}</p>
            <MetricsMiniBar label="CPU" value={device.cpuUsage} />
            <MetricsMiniBar label="Memory" value={device.memoryUsage} />
            <MetricsMiniBar label="Storage" value={device.storageUsage} />
            <MiniTrendChart />
          </>
        ) : rack ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{rack.name}</p>
              <StatusBadge status={rack.status} />
            </div>
            <p className="text-muted-foreground">Row {rack.rowId.toUpperCase()} • Room {rack.roomId.toUpperCase()}</p>
            <MetricsMiniBar label="Occupancy" value={rack.occupancy} />
            <MetricsMiniBar label="Power" value={Math.round(rack.powerUsageKw * 10)} />
            <MiniTrendChart />
          </>
        ) : site ? (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{site.name}</p>
              <StatusBadge status={site.status} />
            </div>
            <p className="text-muted-foreground">{site.city}, {site.country} • {site.facilityType}</p>
            <MetricsMiniBar label="Health Score" value={site.healthScore} />
            <MetricsMiniBar label="Power Utilization" value={site.powerUtilization} />
          </>
        ) : region ? (
          <>
            <p className="font-semibold text-foreground">{region.name}</p>
            <p className="text-muted-foreground">Data Centers: {region.dataCenters} • Devices: {region.devices}</p>
          </>
        ) : room ? (
          <p className="text-muted-foreground">{room.name} • {room.rowsCount} rows</p>
        ) : row ? (
          <p className="text-muted-foreground">{row.name} • {row.rackCount} racks</p>
        ) : (
          <p className="text-muted-foreground">Select a region, site, rack, or device to inspect details.</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" onClick={onOpenSystem}>Open System</Button>
          <Button size="sm" variant="outline" onClick={() => onMockAction("Remote Access")}>Remote Access</Button>
          <Button size="sm" variant="outline" onClick={() => onMockAction("Reboot")}>Reboot</Button>
          <Button size="sm" variant="outline" onClick={() => onMockAction("Maintenance Mode")}>Maintenance</Button>
          <Button size="sm" variant="outline" onClick={() => onMockAction("View Alerts")}>View Alerts</Button>
          <Button size="sm" variant="outline" onClick={() => onMockAction("Run Automation")}>Run Automation</Button>
        </div>
      </CardContent>
    </Card>
  );
}
