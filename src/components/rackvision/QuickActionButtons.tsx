import { useState } from "react";
import { AlertTriangle, PlugZap, Power, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuickActionButtonsProps = {
  onOpenSystem: () => void;
  onAction: (action: string) => Promise<void> | void;
};

export function QuickActionButtons({ onOpenSystem, onAction }: QuickActionButtonsProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setPendingAction(action);
    try {
      await onAction(action);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" size="sm" onClick={onOpenSystem} disabled={Boolean(pendingAction)}>
        <PlugZap className="mr-1 h-3.5 w-3.5" /> Open System
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("Remote Access")} disabled={Boolean(pendingAction)}>
        {pendingAction === "Remote Access" ? "Launching..." : "Remote Access"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("Reboot")} disabled={Boolean(pendingAction)}> 
        <Power className="mr-1 h-3.5 w-3.5" /> Reboot
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("Maintenance Mode")} disabled={Boolean(pendingAction)}>
        <Wrench className="mr-1 h-3.5 w-3.5" /> Maintenance
      </Button>
      <Button variant="outline" size="sm" className="col-span-2" onClick={() => handleAction("View Alerts")} disabled={Boolean(pendingAction)}>
        <AlertTriangle className="mr-1 h-3.5 w-3.5" /> View Alerts
      </Button>
    </div>
  );
}
