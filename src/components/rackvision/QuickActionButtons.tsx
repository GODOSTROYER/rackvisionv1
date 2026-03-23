import { AlertTriangle, PlugZap, Power, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuickActionButtonsProps = {
  onOpenSystem: () => void;
  onAction: (action: string) => void;
};

export function QuickActionButtons({ onOpenSystem, onAction }: QuickActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="sm" onClick={onOpenSystem}>
        <PlugZap className="mr-1 h-3.5 w-3.5" /> Open System
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction("Remote Access")}>Remote Access</Button>
      <Button variant="outline" size="sm" onClick={() => onAction("Reboot")}> 
        <Power className="mr-1 h-3.5 w-3.5" /> Reboot
      </Button>
      <Button variant="outline" size="sm" onClick={() => onAction("Maintenance Mode")}>
        <Wrench className="mr-1 h-3.5 w-3.5" /> Maintenance
      </Button>
      <Button variant="outline" size="sm" className="col-span-2" onClick={() => onAction("View Alerts")}>
        <AlertTriangle className="mr-1 h-3.5 w-3.5" /> View Alerts
      </Button>
    </div>
  );
}
