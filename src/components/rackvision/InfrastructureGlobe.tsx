import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { AlertTriangle } from "lucide-react";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import {
  buildStatusTone,
  buildThemePalette,
  defaultGlobePalette,
  markerToSummary,
  normalizeCountryCode,
  type GlobePalette,
} from "@/components/rackvision/globeShared";
import type { EntityHoverSummary, GlobeMarker as GlobeMarkerType } from "@/components/rackvision/types";
import countriesGeoJson from "@/data/countries.json";
import { normalizeGeoJsonFeatures, type GeoJsonFeature } from "@/lib/geojson";
import { MockDataService } from "@/services/rackvision/MockDataService";

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

type GlobeController = {
  globeMaterial?: () => {
    color: { set: (value: string) => void };
    emissive: { set: (value: string) => void };
    emissiveIntensity: number;
    shininess: number;
  } | null;
  controls?: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enablePan: boolean;
    minDistance: number;
    maxDistance: number;
    enableDamping: boolean;
    dampingFactor: number;
  } | null;
  pointOfView: (
    position: { lat: number; lng: number; altitude: number },
    transitionMs?: number,
  ) => void;
};

type CountryFeature = GeoJsonFeature;

function getPointDiagnosticsText(countryCount: number, renderedPoints: number): ReactElement {
  return (
    <>
      Polygons: <span className="font-medium text-foreground">{countryCount}</span> · Points:{" "}
      <span className="font-medium text-foreground">{renderedPoints}</span>
    </>
  );
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
}: InfrastructureGlobeProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeController | null>(null);
  const hoveredMarkerIdRef = useRef<string | null>(null);
  const [size, setSize] = useState({ width: 640, height: 460 });
  const [hoveredCountry, setHoveredCountry] = useState<{ code: string; name: string } | null>(null);
  const [countrySummaryCache, setCountrySummaryCache] = useState<Record<string, EntityHoverSummary>>({});
  const [palette, setPalette] = useState<GlobePalette>(defaultGlobePalette);

  useEffect(() => {
    setPalette(buildThemePalette());
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
    material.emissiveIntensity = 0.03;
    material.shininess = 0.12;
  }, [palette.ocean]);

  const countryData = useMemo(() => normalizeGeoJsonFeatures(countriesGeoJson), []);
  const countries = countryData.features;
  const countryCount = countries.length;
  const diagnostics = countryData.diagnostics;

  useEffect(() => {
    console.log("[InfrastructureGlobe] country polygon source", {
      sourceKind: diagnostics.sourceKind,
      totalFeatures: diagnostics.totalFeatures,
      polygonCount: diagnostics.polygonFeatures,
      totalPoints: diagnostics.totalPoints,
      renderedPoints: diagnostics.renderedPoints,
      firstFeature: diagnostics.firstFeature,
    });
  }, [diagnostics]);

  const countryCodeFor = useCallback(function getCountryCodeForFeature(feature: CountryFeature) {
    const props = feature.properties ?? {};
    const countryName = String(props.ADMIN ?? props.NAME ?? props.name ?? props.NAME_EN ?? "Unknown");
    const countryCode = normalizeCountryCode(
      countryName,
      String(props.ISO_A2 ?? props.iso_a2 ?? props.ISO2 ?? props["ISO3166-1-Alpha-2"] ?? props.id ?? ""),
    );
    return { countryCode, countryName };
  }, []);

  const setHoveredCountrySafe = useCallback(function updateHoveredCountry(next: { code: string; name: string } | null) {
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
  const statusTone = useMemo(() => buildStatusTone(palette), [palette]);

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
      return 0.014;
    },
    [countryCodeFor, hoveredCountry?.code, selectedCountryCode],
  );

  const pointColor = useCallback(function getPointColor(marker: GlobeMarkerType): string {
    return statusTone[marker.healthStatus];
  }, [statusTone]);

  const pointAltitude = useCallback(
    function getPointAltitude(marker: GlobeMarkerType): number {
      if (marker.id === selectedMarkerId) return 0.26;
      if (marker.healthStatus === "Critical") return 0.22;
      if (marker.healthStatus === "Warning") return 0.2;
      return 0.18;
    },
    [selectedMarkerId],
  );

  const pointRadius = useCallback(
    function getPointRadius(marker: GlobeMarkerType): number {
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
      <div ref={containerRef} className="relative h-[360px] w-full rounded-lg border border-border/70 bg-muted/10 sm:h-[440px] xl:h-[520px]">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor={palette.atmosphere}
          atmosphereAltitude={0.09}
          polygonsData={countries}
          polygonsTransitionDuration={0}
          polygonCapColor={polygonCapColor}
          polygonSideColor={function getPolygonSideColor() {
            return "rgba(16, 92, 115, 0.9)";
          }}
          polygonStrokeColor={polygonStrokeColor}
          polygonCapCurvatureResolution={8}
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
          <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] items-start gap-2 rounded-md border border-warning/60 bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm sm:max-w-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
            <div>
              <div className="font-medium">Country polygon data failed to load.</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Source: {diagnostics.sourceKind}. Total features: {diagnostics.totalFeatures}. Rendered points: {diagnostics.renderedPoints}.
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute left-3 top-3 z-20 rounded-md border border-border/70 bg-background/85 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
            {getPointDiagnosticsText(countryCount, diagnostics.renderedPoints)}
          </div>
        )}

        {selectedOrHoveredSummary ? (
          <div className="pointer-events-none absolute left-3 right-3 top-16 z-20 sm:left-auto sm:right-4 sm:top-4">
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
