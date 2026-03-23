import { useEffect, useMemo, useState } from "react";
import { GlobeMarker } from "@/components/rackvision/GlobeMarker";
import { MarkerTooltip } from "@/components/rackvision/MarkerTooltip";
import { GlobeMarker as GlobeMarkerType } from "@/components/rackvision/types";

type InfrastructureGlobeProps = {
  markers: GlobeMarkerType[];
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  onHoverMarker: (id: string | null) => void;
  onSelectMarker: (id: string) => void;
  regionLookup: Record<string, string>;
};

function projectMarker(latitude: number, longitude: number, rotation: number) {
  const lat = (latitude * Math.PI) / 180;
  const lng = ((longitude + rotation) * Math.PI) / 180;
  const x = Math.cos(lat) * Math.sin(lng);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lng);
  const perspective = 0.55 + (z + 1) * 0.25;
  return {
    visible: z > -0.35,
    left: 50 + x * 34,
    top: 50 - y * 34,
    depth: z,
    scale: perspective,
  };
}

export function InfrastructureGlobe({ markers, selectedMarkerId, hoveredMarkerId, onHoverMarker, onSelectMarker, regionLookup }: InfrastructureGlobeProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const animate = () => {
      setRotation((prev) => (prev + 0.12) % 360);
      rafId = window.requestAnimationFrame(animate);
    };
    if (!hoveredMarkerId) rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, [hoveredMarkerId]);

  const projectedMarkers = useMemo(
    () =>
      markers
        .map((marker) => ({ marker, projection: projectMarker(marker.latitude, marker.longitude, rotation) }))
        .filter((item) => item.projection.visible)
        .sort((a, b) => a.projection.depth - b.projection.depth),
    [markers, rotation],
  );

  const hoveredMarker = markers.find((marker) => marker.id === hoveredMarkerId) ?? null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mx-auto aspect-square max-h-[440px] w-full max-w-[440px] rounded-full border border-border bg-[radial-gradient(circle_at_35%_30%,hsl(var(--accent)),hsl(var(--background))_62%)] shadow-[inset_0_0_40px_hsl(var(--primary)/0.1)]">
        <div className="relative h-full w-full rounded-full border border-border/80 bg-[radial-gradient(circle_at_50%_60%,hsl(var(--muted)),transparent_65%)]">
          <div className="absolute inset-[8%] rounded-full border border-border/70" />
          <div className="absolute inset-[20%] rounded-full border border-border/60" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/70" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border/70" />

          {projectedMarkers.map(({ marker, projection }) => (
            <GlobeMarker
              key={marker.id}
              marker={marker}
              left={projection.left}
              top={projection.top}
              scale={projection.scale}
              depth={projection.depth}
              selected={selectedMarkerId === marker.id}
              hovered={hoveredMarkerId === marker.id}
              onHover={onHoverMarker}
              onSelect={onSelectMarker}
            />
          ))}
        </div>
      </div>

      {hoveredMarker ? (
        <div className="absolute right-4 top-4 z-20">
          <MarkerTooltip marker={hoveredMarker} regionName={hoveredMarker.regionId ? regionLookup[hoveredMarker.regionId] : undefined} />
        </div>
      ) : null}
    </div>
  );
}
