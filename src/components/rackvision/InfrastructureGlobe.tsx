import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import { MockDataService } from "@/services/rackvision/MockDataService";
import { EntityHoverSummary, GlobeMarker as GlobeMarkerType } from "@/components/rackvision/types";
import countriesGeoJson from "@/data/countries.json";

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

type CountryFeature = {
  properties?: Record<string, string | number | undefined>;
};

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
  const hoveredMarkerIdRef = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 640, height: 460 });
  const [hoveredCountry, setHoveredCountry] = useState<{ code: string; name: string } | null>(null);
  const [countrySummaryCache, setCountrySummaryCache] = useState<Record<string, EntityHoverSummary>>({});
  const [palette, setPalette] = useState({
    ocean: "hsl(214 42% 18%)",
    atmosphere: "hsl(214 58% 62%)",
    land: "hsl(214 28% 34%)",
    landHovered: "hsl(214 46% 48%)",
    landSelected: "hsl(213 72% 58%)",
    border: "hsl(213 22% 64%)",
    borderActive: "hsl(214 86% 74%)",
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
      ocean: readVar("--primary", "hsl(214 42% 18%)"),
      atmosphere: readVar("--accent", "hsl(214 58% 62%)"),
      land: readVar("--secondary", "hsl(214 28% 34%)"),
      landHovered: readVar("--accent", "hsl(214 46% 48%)"),
      landSelected: readVar("--primary", "hsl(213 72% 58%)"),
      border: readVar("--border", "hsl(213 22% 64%)"),
      borderActive: readVar("--accent", "hsl(214 86% 74%)"),
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
    const material = globeRef.current?.globeMaterial?.();
    if (!material) return;
    material.color.set(palette.ocean);
    material.emissive.set(palette.ocean);
    material.emissiveIntensity = 0.3;
    material.shininess = 0.1;
  }, [palette.ocean]);

  const countries = useMemo<CountryFeature[]>(() => {
    const geoJson = countriesGeoJson as { features?: CountryFeature[] };
    return Array.isArray(geoJson.features) ? geoJson.features : [];
  }, []);

  const countryCodeFor = useCallback((feature: CountryFeature) => {
    const props = feature?.properties ?? {};
    const countryName = String(props.ADMIN ?? props.NAME ?? props.name ?? "Unknown");
    const countryCode = normalizeCountryCode(countryName, String(props.ISO_A2 ?? props.iso_a2 ?? props.ISO2 ?? props.id ?? ""));
    return { countryCode, countryName };
  }, []);

  const setHoveredCountrySafe = useCallback((next: { code: string; name: string } | null) => {
    setHoveredCountry((previous) => {
      if (previous?.code === next?.code && previous?.name === next?.name) return previous;
      return next;
    });
  }, []);

  const activeCountryCode = hoveredCountry?.code ?? selectedCountryCode ?? null;

  useEffect(() => {
    if (!activeCountryCode || countrySummaryCache[activeCountryCode]) return;
    const loadSummary = async () => {
      const summary = await MockDataService.getCountryInfrastructureSummary(activeCountryCode);
      setCountrySummaryCache((previous) => ({
        ...previous,
        [activeCountryCode]: {
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
  }, [activeCountryCode, countrySummaryCache]);

  const hoveredMarker = markers.find((marker) => marker.id === hoveredMarkerId) ?? null;
  const markerSummary = hoveredMarker ? markerToSummary(hoveredMarker, regionLookup) : null;
  const countrySummary = activeCountryCode ? countrySummaryCache[activeCountryCode] : null;
  const statusTone = useMemo<Record<GlobeMarkerType["healthStatus"], string>>(
    () => ({
      Healthy: palette.healthy,
      Warning: palette.warning,
      Critical: palette.critical,
      Offline: palette.offline,
      Maintenance: palette.maintenance,
    }),
    [palette],
  );

  useEffect(() => {
    const controls = globeRef.current?.controls?.();
    if (!controls) return;
    controls.autoRotate = !hoveredCountry && !hoveredMarkerId && !selectedMarkerId && !selectedCountryCode;
    controls.autoRotateSpeed = 0.07;
    controls.enablePan = false;
    controls.minDistance = 165;
    controls.maxDistance = 290;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
  }, [hoveredCountry, hoveredMarkerId, selectedCountryCode, selectedMarkerId]);

  useEffect(() => {
    const selected = markers.find((marker) => marker.id === selectedMarkerId);
    if (!selected || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: selected.latitude, lng: selected.longitude, altitude: 1.6 }, 900);
  }, [markers, selectedMarkerId]);

  const selectedOrHoveredSummary = markerSummary ?? countrySummary;

  const ringMarkers = useMemo(
    () => markers.filter((marker) => marker.healthStatus === "Critical" || marker.healthStatus === "Warning"),
    [markers],
  );

  const polygonCapColor = useCallback(
    (feature: CountryFeature) => {
      const { countryCode } = countryCodeFor(feature);
      if (countryCode === selectedCountryCode) return palette.landSelected;
      if (hoveredCountry?.code === countryCode) return palette.landHovered;
      return palette.land;
    },
    [countryCodeFor, hoveredCountry?.code, palette.land, palette.landHovered, palette.landSelected, selectedCountryCode],
  );

  const polygonStrokeColor = useCallback(
    (feature: CountryFeature) => {
      const { countryCode } = countryCodeFor(feature);
      return hoveredCountry?.code === countryCode || countryCode === selectedCountryCode ? palette.borderActive : palette.border;
    },
    [countryCodeFor, hoveredCountry?.code, palette.border, palette.borderActive, selectedCountryCode],
  );

  const polygonAltitude = useCallback(
    (feature: CountryFeature) => {
      const { countryCode } = countryCodeFor(feature);
      if (hoveredCountry?.code === countryCode) return 0.022;
      if (countryCode === selectedCountryCode) return 0.016;
      return 0.006;
    },
    [countryCodeFor, hoveredCountry?.code, selectedCountryCode],
  );

  const pointColor = useCallback((marker: GlobeMarkerType) => statusTone[marker.healthStatus], [statusTone]);

  const pointAltitude = useCallback(
    (marker: GlobeMarkerType) => (marker.id === selectedMarkerId ? 0.22 : marker.healthStatus === "Critical" ? 0.18 : 0.14),
    [selectedMarkerId],
  );

  const pointRadius = useCallback(
    (marker: GlobeMarkerType) => {
      if (marker.id === selectedMarkerId) return 0.72;
      if (marker.healthStatus === "Critical") return 0.6;
      if (marker.healthStatus === "Warning") return 0.54;
      return 0.48;
    },
    [selectedMarkerId],
  );

  const onPolygonHover = useCallback(
    (feature: CountryFeature | null) => {
      if (!feature) {
        setHoveredCountrySafe(null);
        return;
      }
      const { countryCode, countryName } = countryCodeFor(feature);
      setHoveredCountrySafe({ code: countryCode, name: countryName });
    },
    [countryCodeFor, setHoveredCountrySafe],
  );

  const onPointHoverInternal = useCallback(
    (marker: GlobeMarkerType | null) => {
      const nextId = marker?.id ?? null;
      if (hoveredMarkerIdRef.current === nextId) return;
      hoveredMarkerIdRef.current = nextId;
      onHoverMarker(nextId);
    },
    [onHoverMarker],
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <div ref={containerRef} className="relative h-[520px] w-full rounded-lg border border-border/70 bg-muted/10">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor={palette.atmosphere}
          atmosphereAltitude={0.08}
          polygonsData={countries}
          polygonsTransitionDuration={0}
          polygonCapColor={polygonCapColor}
          polygonSideColor={() => palette.land}
          polygonStrokeColor={polygonStrokeColor}
          polygonAltitude={polygonAltitude}
          polygonLabel={null}
          onPolygonHover={onPolygonHover}
          onPolygonClick={(feature: CountryFeature) => {
            const { countryCode } = countryCodeFor(feature);
            onSelectCountry?.(countryCode);
          }}
          pointsData={markers}
          pointsTransitionDuration={0}
          pointLat="latitude"
          pointLng="longitude"
          pointColor={pointColor}
          pointAltitude={pointAltitude}
          pointRadius={pointRadius}
          pointsMerge={false}
          onPointHover={onPointHoverInternal}
          onPointClick={(marker: GlobeMarkerType) => onSelectMarker(marker.id)}
          ringsData={ringMarkers}
          ringLat="latitude"
          ringLng="longitude"
          ringColor={pointColor}
          ringMaxRadius={2.8}
          ringPropagationSpeed={0.95}
          ringRepeatPeriod={1600}
        />

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
