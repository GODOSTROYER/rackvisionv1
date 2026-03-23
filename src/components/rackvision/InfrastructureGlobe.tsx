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
  type?: string;
  geometry?: {
    type?: string;
  };
  properties?: Record<string, unknown>;
};

type CountryCollectionLike = {
  type?: string;
  features?: unknown;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCountryFeatures(source: unknown): CountryFeature[] {
  const rawFeatures = Array.isArray(source)
    ? source
    : isRecord(source) && Array.isArray((source as CountryCollectionLike).features)
      ? ((source as CountryCollectionLike).features as unknown[])
      : [];

  return rawFeatures.filter((feature): feature is CountryFeature => {
    if (!isRecord(feature)) return false;
    const geometryType = isRecord(feature.geometry) ? feature.geometry.type : undefined;
    return geometryType === "Polygon" || geometryType === "MultiPolygon";
  });
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
    ocean: "hsl(214 36% 24%)",
    atmosphere: "hsl(214 58% 70%)",
    land: "hsl(214 34% 48%)",
    landHovered: "hsl(214 54% 62%)",
    landSelected: "hsl(213 78% 66%)",
    border: "hsl(213 28% 72%)",
    borderActive: "hsl(214 88% 84%)",
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
      ocean: readVar("--secondary", "hsl(214 36% 24%)"),
      atmosphere: readVar("--accent", "hsl(214 58% 70%)"),
      land: readVar("--muted", "hsl(214 34% 48%)"),
      landHovered: readVar("--accent", "hsl(214 54% 62%)"),
      landSelected: readVar("--primary", "hsl(213 78% 66%)"),
      border: readVar("--border", "hsl(213 28% 72%)"),
      borderActive: readVar("--accent", "hsl(214 88% 84%)"),
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
    material.emissive.set(palette.atmosphere);
    material.emissiveIntensity = 0.08;
    material.shininess = 0.25;
  }, [palette.atmosphere, palette.ocean]);

  const countries = useMemo<CountryFeature[]>(() => {
    return normalizeCountryFeatures(countriesGeoJson);
  }, []);

  const countryCount = countries.length;

  useEffect(() => {
    const source = countriesGeoJson as unknown;
    const isFeatureCollection = isRecord(source) && source.type === "FeatureCollection";
    const isFeatureArray = Array.isArray(source);
    console.log("[InfrastructureGlobe] country polygon source", {
      isFeatureCollection,
      isFeatureArray,
      countryCount,
      firstFeature: countries[0],
    });
  }, [countries, countryCount]);

  const countryCodeFor = useCallback((feature: CountryFeature) => {
    const props = feature?.properties ?? {};
    const countryName = String(props.ADMIN ?? props.NAME ?? props.name ?? props.NAME_EN ?? "Unknown");
    const countryCode = normalizeCountryCode(
      countryName,
      String(props.ISO_A2 ?? props.iso_a2 ?? props.ISO2 ?? props["ISO3166-1-Alpha-2"] ?? props.id ?? ""),
    );
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
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.02;
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
      if (hoveredCountry?.code === countryCode) return 0.026;
      if (countryCode === selectedCountryCode) return 0.02;
      return 0.009;
    },
    [countryCodeFor, hoveredCountry?.code, selectedCountryCode],
  );

  const pointColor = useCallback((marker: GlobeMarkerType) => statusTone[marker.healthStatus], [statusTone]);

  const pointAltitude = useCallback(
    (marker: GlobeMarkerType) => (marker.id === selectedMarkerId ? 0.26 : marker.healthStatus === "Critical" ? 0.22 : marker.healthStatus === "Warning" ? 0.2 : 0.18),
    [selectedMarkerId],
  );

  const pointRadius = useCallback(
    (marker: GlobeMarkerType) => {
      if (marker.id === selectedMarkerId) return 0.82;
      if (marker.healthStatus === "Critical") return 0.72;
      if (marker.healthStatus === "Warning") return 0.66;
      return 0.58;
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
          ringMaxRadius={3.4}
          ringPropagationSpeed={1.1}
          ringRepeatPeriod={1600}
        />

        {!countryCount ? (
          <div className="absolute left-3 top-3 z-20 rounded-md border border-warning/60 bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm">
            Country polygon data failed to load.
          </div>
        ) : null}

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
