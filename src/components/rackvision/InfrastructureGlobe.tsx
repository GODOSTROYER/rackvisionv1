import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import { MockDataService } from "@/services/rackvision/MockDataService";
import { EntityHoverSummary, GlobeMarker as GlobeMarkerType } from "@/components/rackvision/types";

type InfrastructureGlobeProps = {
  markers: GlobeMarkerType[];
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  selectedCountryCode?: string | null;
  onHoverMarker: (id: string | null) => void;
  onSelectMarker: (id: string) => void;
  onSelectCountry?: (countryCode: string) => void;
  regionLookup: Record<string, string>;
};

const COUNTRIES_GEOJSON_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const countryAlias: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  india: "IN",
  germany: "DE",
};

function normalizeCountryCode(name: string, rawCode: string | undefined) {
  const code = rawCode?.trim().toUpperCase();
  if (code && code.length === 2 && code !== "-99") return code;
  return countryAlias[name.toLowerCase()] ?? name.slice(0, 2).toUpperCase();
}

function markerToSummary(marker: GlobeMarkerType, regionLookup: Record<string, string>): EntityHoverSummary {
  return {
    id: marker.id,
    kind: marker.kind,
    title: marker.name,
    subtitle:
      marker.kind === "site"
        ? `${marker.city ?? "Unknown City"}, ${marker.country ?? "Unknown Country"}`
        : marker.regionId
          ? regionLookup[marker.regionId]
          : "Region",
    healthStatus: marker.healthStatus,
    metrics: [
      ...(marker.kind === "region" ? [{ label: "Sites", value: marker.metrics.sites ?? 0 }] : []),
      ...(typeof marker.metrics.rooms === "number" ? [{ label: "Rooms", value: marker.metrics.rooms }] : []),
      ...(typeof marker.metrics.rows === "number" ? [{ label: "Rows", value: marker.metrics.rows }] : []),
      { label: "Racks", value: marker.metrics.racks },
      { label: "Devices", value: marker.metrics.devices },
      { label: "Warning", value: marker.metrics.warning },
      { label: "Critical", value: marker.metrics.critical },
      { label: "Alerts", value: marker.metrics.activeAlerts },
      ...(typeof marker.metrics.occupancyPercent === "number" ? [{ label: "Occupancy", value: `${marker.metrics.occupancyPercent}%` }] : []),
    ],
  };
}

export function InfrastructureGlobe({
  markers,
  selectedMarkerId,
  hoveredMarkerId,
  selectedCountryCode,
  onHoverMarker,
  onSelectMarker,
  onSelectCountry,
  regionLookup,
}: InfrastructureGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 640, height: 460 });
  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<{ code: string; name: string } | null>(null);
  const [countrySummaryCache, setCountrySummaryCache] = useState<Record<string, EntityHoverSummary>>({});
  const [countryLoadError, setCountryLoadError] = useState<string | null>(null);
  const [isCountryLoading, setIsCountryLoading] = useState(true);
  const [palette, setPalette] = useState({
    ocean: "hsl(214 38% 14%)",
    atmosphere: "hsl(214 60% 45%)",
    land: "hsl(210 18% 88%)",
    landHovered: "hsl(213 45% 72%)",
    landSelected: "hsl(213 72% 58%)",
    border: "hsl(214 20% 68%)",
    borderActive: "hsl(215 58% 38%)",
    healthy: "hsl(142 70% 42%)",
    warning: "hsl(40 92% 48%)",
    critical: "hsl(0 84% 52%)",
    offline: "hsl(221 16% 45%)",
    maintenance: "hsl(215 16% 56%)",
  });

  useEffect(() => {
    const root = window.getComputedStyle(document.documentElement);
    const readVar = (token: string, fallback: string) => {
      const value = root.getPropertyValue(token).trim();
      return value ? `hsl(${value})` : fallback;
    };
    setPalette({
      ocean: readVar("--primary", "hsl(214 38% 14%)"),
      atmosphere: readVar("--accent", "hsl(214 60% 45%)"),
      land: readVar("--muted", "hsl(210 18% 88%)"),
      landHovered: readVar("--accent", "hsl(213 45% 72%)"),
      landSelected: readVar("--primary", "hsl(213 72% 58%)"),
      border: readVar("--border", "hsl(214 20% 68%)"),
      borderActive: readVar("--primary", "hsl(215 58% 38%)"),
      healthy: readVar("--healthy", "hsl(142 70% 42%)"),
      warning: readVar("--warning", "hsl(40 92% 48%)"),
      critical: readVar("--critical", "hsl(0 84% 52%)"),
      offline: readVar("--offline", "hsl(221 16% 45%)"),
      maintenance: readVar("--muted-foreground", "hsl(215 16% 56%)"),
    });
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const next = entries[0];
      if (!next) return;
      setSize({
        width: Math.max(320, Math.floor(next.contentRect.width)),
        height: Math.max(360, Math.floor(next.contentRect.height)),
      });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsCountryLoading(true);
        const response = await fetch(COUNTRIES_GEOJSON_URL);
        if (!response.ok) throw new Error("Geo dataset unavailable");
        const geojson = await response.json();
        setCountries(Array.isArray(geojson.features) ? geojson.features : []);
        setCountryLoadError(null);
      } catch {
        setCountryLoadError("Unable to load country polygons.");
      } finally {
        setIsCountryLoading(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!hoveredCountry || countrySummaryCache[hoveredCountry.code]) return;
    const loadSummary = async () => {
      const summary = await MockDataService.getCountryInfrastructureSummary(hoveredCountry.code);
      setCountrySummaryCache((previous) => ({
        ...previous,
        [hoveredCountry.code]: {
          id: summary.countryCode,
          kind: "country",
          title: summary.countryName,
          subtitle: "Country",
          healthStatus: summary.healthStatus,
          metrics: [
            { label: "Sites", value: summary.sites },
            { label: "Rooms", value: summary.rooms },
            { label: "Rows", value: summary.rows },
            { label: "Racks", value: summary.racks },
            { label: "Devices", value: summary.devices },
            { label: "Alerts", value: summary.activeAlerts },
            { label: "Utilization", value: `${summary.avgUtilization}%` },
          ],
        },
      }));
    };

    loadSummary();
  }, [countrySummaryCache, hoveredCountry]);

  const hoveredMarker = markers.find((marker) => marker.id === hoveredMarkerId) ?? null;
  const markerSummary = hoveredMarker ? markerToSummary(hoveredMarker, regionLookup) : null;
  const countrySummary = hoveredCountry ? countrySummaryCache[hoveredCountry.code] : null;
  const statusTone: Record<GlobeMarkerType["healthStatus"], string> = {
    Healthy: palette.healthy,
    Warning: palette.warning,
    Critical: palette.critical,
    Offline: palette.offline,
    Maintenance: palette.maintenance,
  };

  useEffect(() => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.autoRotate = !hoveredCountry && !hoveredMarkerId;
    controls.autoRotateSpeed = 0.25;
    controls.enablePan = false;
    controls.minDistance = 170;
    controls.maxDistance = 300;
  }, [hoveredCountry, hoveredMarkerId]);

  useEffect(() => {
    const selected = markers.find((marker) => marker.id === selectedMarkerId);
    if (!selected || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: selected.latitude, lng: selected.longitude, altitude: 1.6 }, 900);
  }, [markers, selectedMarkerId]);

  const selectedOrHoveredSummary = markerSummary ?? countrySummary;

  const countryCodeFor = (feature: any) => {
    const props = feature?.properties ?? {};
    const countryName = String(props.ADMIN ?? props.NAME ?? props.name ?? "Unknown");
    const countryCode = normalizeCountryCode(countryName, props.ISO_A2 ?? props.iso_a2 ?? props.ISO2 ?? props.id);
    return { countryCode, countryName };
  };

  const ringMarkers = useMemo(
    () => markers.filter((marker) => marker.healthStatus === "Critical" || marker.healthStatus === "Warning"),
    [markers],
  );

  if (countryLoadError) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          {countryLoadError} Marker-driven global view remains available.
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <div ref={containerRef} className="relative h-[520px] w-full rounded-lg border border-border/70 bg-muted/10">
        {isCountryLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading globe polygons…</div>
        ) : (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            showAtmosphere
            atmosphereColor={palette.atmosphere}
            atmosphereAltitude={0.14}
            polygonsData={countries}
            polygonCapColor={(feature: any) => {
              const { countryCode } = countryCodeFor(feature);
              if (countryCode === selectedCountryCode) return palette.landSelected;
              if (hoveredCountry?.code === countryCode) return palette.landHovered;
              return palette.land;
            }}
            polygonSideColor={() => palette.land}
            polygonStrokeColor={(feature: any) => {
              const { countryCode } = countryCodeFor(feature);
              return hoveredCountry?.code === countryCode || countryCode === selectedCountryCode ? palette.borderActive : palette.border;
            }}
            polygonAltitude={(feature: any) => {
              const { countryCode } = countryCodeFor(feature);
              if (hoveredCountry?.code === countryCode) return 0.03;
              if (countryCode === selectedCountryCode) return 0.024;
              return 0.008;
            }}
            onPolygonHover={(feature: any) => {
              if (!feature) {
                setHoveredCountry(null);
                return;
              }
              const { countryCode, countryName } = countryCodeFor(feature);
              setHoveredCountry({ code: countryCode, name: countryName });
            }}
            onPolygonClick={(feature: any) => {
              const { countryCode } = countryCodeFor(feature);
              onSelectCountry?.(countryCode);
            }}
            pointsData={markers}
            pointLat="latitude"
            pointLng="longitude"
            pointColor={(marker: GlobeMarkerType) => statusTone[marker.healthStatus]}
            pointAltitude={(marker: GlobeMarkerType) => (marker.id === selectedMarkerId ? 0.18 : 0.1)}
            pointRadius={(marker: GlobeMarkerType) => (marker.id === selectedMarkerId ? 0.65 : marker.healthStatus === "Critical" ? 0.52 : 0.42)}
            pointsMerge={false}
            onPointHover={(marker: GlobeMarkerType | null) => onHoverMarker(marker?.id ?? null)}
            onPointClick={(marker: GlobeMarkerType) => onSelectMarker(marker.id)}
            ringsData={ringMarkers}
            ringLat="latitude"
            ringLng="longitude"
            ringColor={(marker: GlobeMarkerType) => statusTone[marker.healthStatus]}
            ringMaxRadius={2.3}
            ringPropagationSpeed={0.9}
            ringRepeatPeriod={1700}
          />
        )}

        {selectedOrHoveredSummary ? (
          <div className="pointer-events-none absolute right-4 top-4 z-20">
            <EntityHoverSummaryCard summary={selectedOrHoveredSummary} />
          </div>
        ) : null}

        {!markers.length ? (
          <div className="absolute bottom-3 left-3 rounded-md border border-border bg-background/95 px-2.5 py-1.5 text-xs text-muted-foreground">
            No site markers available for current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
