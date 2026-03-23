import { InfraRack } from "@/data/mockData";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RackGridProps = {
  racks: InfraRack[];
  selectedRackId: string;
  onSelectRack: (rackId: string) => void;
};

export function RackGrid({ racks, selectedRackId, onSelectRack }: RackGridProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {racks.map((rack) => (
        <Card
          key={rack.id}
          className={`cursor-pointer border-border/80 shadow-sm transition hover:shadow ${
            selectedRackId === rack.id ? "ring-1 ring-primary" : ""
          }`}
          onClick={() => onSelectRack(rack.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              {rack.name} <StatusBadge status={rack.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p>Occupancy: <span className="text-foreground">{rack.occupancy}%</span></p>
            <p>Devices: <span className="text-foreground">{rack.deviceCount}</span></p>
            <p>Temp: <span className="text-foreground">{rack.temperature}°C</span></p>
            <p>Power: <span className="text-foreground">{rack.powerUsageKw}kW</span></p>
            <p>Alerts: <span className="text-foreground">{rack.alerts}</span></p>
            <p>Row: <span className="text-foreground">{rack.rowId.toUpperCase()}</span></p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
