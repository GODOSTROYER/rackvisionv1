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

function getDeviceDensity(gridRowSpan: number): "compact" | "standard" | "detailed" {
  if (gridRowSpan <= 1) {
    return "compact";
  }

  if (gridRowSpan <= 2) {
    return "standard";
  }

  return "detailed";
}

export function RackDeviceBlock({ item, selected, onSelect, onHover, onOpenSystem }: RackDeviceBlockProps) {
  const { device, gridRowStart, gridRowSpan } = item;
  const density = getDeviceDensity(gridRowSpan);
  const rackUnitLabel = `U${device.rackUnitStart}-${device.rackUnitStart + device.rackUnitSize - 1}`;

  return (
    <HoverCard openDelay={100} closeDelay={60}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          style={{ gridRow: `${gridRowStart} / span ${gridRowSpan}` }}
          className={cn(
            "relative z-10 m-0.5 flex h-[calc(100%-4px)] min-h-0 flex-col overflow-hidden rounded border px-2 py-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            typeTone[device.deviceType] ?? "bg-card",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/60",
          )}
          onClick={() => onSelect(device.id)}
          onDoubleClick={() => onOpenSystem(device.id)}
          onMouseEnter={() => onHover(device.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(device.id)}
          onBlur={() => onHover(null)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              onSelect(device.id);
            }

            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              onOpenSystem(device.id);
            }

            if (event.key === "Enter" && selected) {
              event.preventDefault();
              onOpenSystem(device.id);
            }
          }}
          aria-label={`${device.name} in ${rackUnitLabel}`}
          aria-pressed={selected}
        >
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={cn(
                  "font-medium leading-tight text-foreground whitespace-normal break-words",
                  density === "compact" ? "text-[10px]" : "text-[11px]",
                )}
              >
                {device.name}
              </p>
              {density !== "compact" ? (
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground whitespace-normal break-all">
                  {device.deviceType} • {rackUnitLabel}
                </p>
              ) : null}
            </div>
            <StatusBadge status={device.healthStatus} />
          </div>

          {density === "detailed" ? (
            <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] leading-tight text-muted-foreground">
              <p className="break-all">
                IP: <span className="text-foreground">{device.ipAddress}</span>
              </p>
              <p>
                CPU: <span className="text-foreground">{device.cpuUsage}%</span>
              </p>
              <p>
                Mem: <span className="text-foreground">{device.memoryUsage}%</span>
              </p>
              <p>
                Temp: <span className="text-foreground">{device.temperature}°C</span>
              </p>
            </div>
          ) : null}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="border-border bg-card">
        <RackHoverCard device={device} onOpenDetails={() => onOpenSystem(device.id)} />
      </HoverCardContent>
    </HoverCard>
  );
}
