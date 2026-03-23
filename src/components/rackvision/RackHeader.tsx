import { ChevronLeft, ChevronRight, Download, Hammer, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RackViewModel } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type RackHeaderProps = {
  model: RackViewModel;
  siteName: string;
  onPrevRack: () => void;
  onNextRack: () => void;
  onOpenSystem: () => void;
  onViewAlerts: () => void;
  onMaintenance: () => void;
  onExport: () => void;
};

export function RackHeader({ model, siteName, onPrevRack, onNextRack, onOpenSystem, onViewAlerts, onMaintenance, onExport }: RackHeaderProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-foreground">{model.rack.name}</p>
            <StatusBadge status={model.rack.healthStatus} />
          </div>
          <p className="text-xs text-muted-foreground">{siteName} • {model.rack.roomName} • {model.rack.rowName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button size="sm" variant="outline" onClick={onPrevRack} disabled={!model.previousRackId}><ChevronLeft className="h-4 w-4" />Previous</Button>
          <Button size="sm" variant="outline" onClick={onNextRack} disabled={!model.nextRackId}>Next<ChevronRight className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={onOpenSystem}>Open in Systems</Button>
          <Button size="sm" variant="outline" onClick={onViewAlerts}><ShieldAlert className="h-4 w-4" />View Alerts</Button>
          <Button size="sm" variant="outline" onClick={onMaintenance}><Hammer className="h-4 w-4" />Maintenance</Button>
          <Button size="sm" variant="outline" onClick={onExport}><Download className="h-4 w-4" />Export</Button>
        </div>
      </div>
    </div>
  );
}
