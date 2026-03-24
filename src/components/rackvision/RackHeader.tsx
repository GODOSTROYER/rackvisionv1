import { ChevronLeft, ChevronRight, Download, Hammer, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RackViewModel } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type RackHeaderProps = {
  model: RackViewModel;
  siteName: string;
  onPrevRack: () => Promise<void> | void;
  onNextRack: () => Promise<void> | void;
  onOpenSystem: () => Promise<void> | void;
  onViewAlerts: () => Promise<void> | void;
  onMaintenance: () => Promise<void> | void;
  onExport: () => Promise<void> | void;
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
        <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:justify-end">
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onPrevRack} disabled={!model.previousRackId}><ChevronLeft className="h-4 w-4" />Previous</Button>
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onNextRack} disabled={!model.nextRackId}>Next<ChevronRight className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={onOpenSystem}>Open in Systems</Button>
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onViewAlerts}><ShieldAlert className="h-4 w-4" />View Alerts</Button>
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onMaintenance}><Hammer className="h-4 w-4" />Maintenance</Button>
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={onExport}><Download className="h-4 w-4" />Export</Button>
        </div>
      </div>
    </div>
  );
}
