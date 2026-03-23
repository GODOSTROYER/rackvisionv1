import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { RackDeviceViewModel } from "@/components/rackvision/types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { RackHoverCard } from "@/components/rackvision/RackHoverCard";

type RackDeviceBlockProps = {
  item: RackDeviceViewModel;
  selected: boolean;
  onSelect: (deviceId: string) => void;
  onHover: (deviceId: string | null) => void;
  onOpenSystem: (deviceId: string) => void;
};

const typeTone: Record<string, string> = {
  "Server-1U": "bg-primary/10",
  "Server-2U": "bg-primary/10",
  "Appliance-4U": "bg-secondary/60",
  Storage: "bg-accent/60",
  "Switch-ToR": "bg-muted/70",
  Firewall: "bg-destructive/10",
  PDU: "bg-muted/60",
  "Blank-Panel": "bg-muted/40",
};

export function RackDeviceBlock({ item, selected, onSelect, onHover, onOpenSystem }: RackDeviceBlockProps) {
  const { device, gridRowStart, gridRowSpan } = item;

  return (
    <HoverCard openDelay={100} closeDelay={60}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          style={{ gridRow: `${gridRowStart} / span ${gridRowSpan}` }}
          className={cn(
            "relative z-10 m-0.5 rounded border px-2 py-1 text-left transition",
            typeTone[device.deviceType] ?? "bg-card",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/60",
          )}
          onClick={() => onSelect(device.id)}
          onDoubleClick={() => onOpenSystem(device.id)}
          onMouseEnter={() => onHover(device.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium text-foreground">{device.name}</p>
            <StatusBadge status={device.healthStatus} />
          </div>
          <p className="truncate text-[10px] text-muted-foreground">{device.deviceType} • {device.ipAddress}</p>
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="border-border bg-card">
        <RackHoverCard device={device} onOpenDetails={() => onOpenSystem(device.id)} />
      </HoverCardContent>
    </HoverCard>
  );
}
