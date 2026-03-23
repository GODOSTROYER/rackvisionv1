import { GlobeMarker as GlobeMarkerType } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type GlobeMarkerProps = {
  marker: GlobeMarkerType;
  left: number;
  top: number;
  scale: number;
  depth: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

const toneMap = {
  Healthy: "bg-[hsl(var(--healthy))]",
  Warning: "bg-[hsl(var(--warning))]",
  Critical: "bg-[hsl(var(--critical))]",
  Offline: "bg-[hsl(var(--offline))]",
  Maintenance: "bg-muted-foreground",
};

export function GlobeMarker({ marker, left, top, scale, depth, selected, hovered, onHover, onSelect }: GlobeMarkerProps) {
  const isCritical = marker.healthStatus === "Critical";
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(marker.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(marker.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(marker.id)}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform"
      style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -50%) scale(${scale})`, zIndex: Math.floor(100 + depth * 100) }}
      aria-label={marker.name}
    >
      <span className={cn("relative block h-3.5 w-3.5 rounded-full border border-background", toneMap[marker.healthStatus])}>
        {(selected || hovered || isCritical) && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", toneMap[marker.healthStatus])} />}
      </span>
      {selected ? <span className="mt-1 block rounded bg-background/90 px-1 py-0.5 text-[10px] font-medium text-foreground">{marker.name}</span> : null}
    </button>
  );
}
