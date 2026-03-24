import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, KeyRound, Map } from "lucide-react";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import {
  buildStatusTone,
  buildThemePalette,
  defaultGlobePalette,
  markerToSummary,
  normalizeCountryCode,
  type GlobePalette,
} from "@/components/rackvision/globeShared";
import type { EntityHoverSummary, GlobeMarker } from "@/components/rackvision/types";
import countriesGeoJson from "@/data/countries.json";
import { normalizeGeoJsonFeatures, type GeoJsonFeature } from "@/lib/geojson";
import { MockDataService } from "@/services/rackvision/MockDataService";

type MapboxInfrastructureGlobeProps = {
  markers: GlobeMarker[];
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  selectedCountryCode?: string | null;
  onHoverMarker: (id: string | null) => void;
  onSelectMarker: (id: string) => void;
  onSelectCountry?: (countryCode: string) => void;
  regionLookup: Record<string, string>;
};

type MapboxModule = typeof import("mapbox-gl");
type MapboxMap = import("mapbox-gl").Map;
type MapboxGeoJsonSource = import("mapbox-gl").GeoJSONSource;

type CountryFeature = GeoJsonFeature;

type CountryFeatureProperties = {
  countryCode: string;
  countryName: string;
};

type MarkerFeatureProperties = {
  id: string;
  kind: GlobeMarker["kind"];
  name: string;
  healthStatus: GlobeMarker["healthStatus"];
  regionId?: string;
  country?: string;
  city?: string;
  sites?: number;
  rooms?: number;
  rows?: number;
  racks: number;
  devices: number;
  warning: number;
  critical: number;
  activeAlerts: number;
  occupancyPercent?: number;
};

type Geometry = CountryFeature["geometry"] | {
  type: "Point";
  coordinates: [number, number];
};

type FeatureCollection<TProperties> = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id?: string | number;
    properties: TProperties;
    geometry: Geometry;
  }>;
};

const BASE_COUNTRIES_SOURCE_ID = "rackvision-countries";
const ACTIVE_COUNTRY_SOURCE_ID = "rackvision-active-country";
const MARKERS_SOURCE_ID = "rackvision-markers";
const BASE_COUNTRIES_LAYER_ID = "rackvision-countries-fill";
const ACTIVE_COUNTRY_LAYER_ID = "rackvision-active-country-fill";
const COUNTRY_BORDERS_LAYER_ID = "rackvision-country-borders";
const MARKERS_LAYER_ID = "rackvision-markers-circle";
const SELECTED_MARKER_LAYER_ID = "rackvision-selected-marker-circle";
const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";
const INITIAL_CENTER: [number, number] = [12, 20];
const INITIAL_ZOOM = 0.95;
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

function getCountryIdentity(feature: CountryFeature): CountryFeatureProperties {
  const props = feature.properties ?? {};
  const countryName = String(props.ADMIN ?? props.NAME ?? props.name ?? props.NAME_EN ?? "Unknown");
  const rawCode = String(props.ISO_A2 ?? props.iso_a2 ?? props.ISO2 ?? props["ISO3166-1-Alpha-2"] ?? props.id ?? "");

  return {
    countryCode: normalizeCountryCode(countryName, rawCode),
    countryName,
  };
}

function createEmptyFeatureCollection<TProperties>(): FeatureCollection<TProperties> {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function buildCountryFeatureCollection(features: CountryFeature[]): FeatureCollection<CountryFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: features.map((feature, index) => {
      const identity = getCountryIdentity(feature);

      return {
        type: "Feature",
        id: identity.countryCode || index,
        properties: identity,
        geometry: feature.geometry,
      };
    }),
  };
}

function buildActiveCountryFeatureCollection(
  countries: FeatureCollection<CountryFeatureProperties>,
  hoveredCountryCode: string | null,
  selectedCountryCode: string | null,
): FeatureCollection<CountryFeatureProperties> {
  const activeCountryCode = hoveredCountryCode ?? selectedCountryCode;

  if (!activeCountryCode) {
    return createEmptyFeatureCollection<CountryFeatureProperties>();
  }

  return {
    type: "FeatureCollection",
    features: countries.features.filter((feature) => feature.properties?.countryCode === activeCountryCode),
  };
}

function buildMarkersFeatureCollection(markers: GlobeMarker[]): FeatureCollection<MarkerFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature",
      id: marker.id,
      properties: {
        id: marker.id,
        kind: marker.kind,
        name: marker.name,
        healthStatus: marker.healthStatus,
        regionId: marker.regionId,
        country: marker.country,
        city: marker.city,
        sites: marker.metrics.sites,
        rooms: marker.metrics.rooms,
        rows: marker.metrics.rows,
        racks: marker.metrics.racks,
        devices: marker.metrics.devices,
        warning: marker.metrics.warning,
        critical: marker.metrics.critical,
        activeAlerts: marker.metrics.activeAlerts,
        occupancyPercent: marker.metrics.occupancyPercent,
      },
      geometry: {
        type: "Point",
        coordinates: [marker.longitude, marker.latitude],
      },
    })),
  };
}

function getPointDiagnosticsText(countryCount: number, renderedPoints: number): ReactElement {
  return (
    <>
      Polygons: <span className="font-medium text-foreground">{countryCount}</span> · Points:{" "}
      <span className="font-medium text-foreground">{renderedPoints}</span>
    </>
  );
}

function getSelectedMarkerCoordinates(markers: GlobeMarker[], selectedMarkerId: string | null): [number, number] | null {
  if (!selectedMarkerId) {
    return null;
  }

  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId);

  if (!selectedMarker) {
    return null;
  }

  return [selectedMarker.longitude, selectedMarker.latitude];
}

function updateGeoJsonSource<TProperties>(
  map: MapboxMap,
  sourceId: string,
  data: FeatureCollection<TProperties>,
): void {
  const source = map.getSource(sourceId) as MapboxGeoJsonSource | undefined;

  if (!source) {
    return;
  }

  source.setData(data);
}

export function MapboxInfrastructureGlobe({
  markers,
  selectedMarkerId,
  hoveredMarkerId,
  selectedCountryCode,
  onHoverMarker,
  onSelectMarker,
  onSelectCountry,
  regionLookup,
}: MapboxInfrastructureGlobeProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const hoveredMarkerIdRef = useRef<string | null>(null);
  const onHoverMarkerRef = useRef(onHoverMarker);
  const onSelectMarkerRef = useRef(onSelectMarker);
  const onSelectCountryRef = useRef(onSelectCountry);
  const [palette, setPalette] = useState<GlobePalette>(defaultGlobePalette);
  const [mapReady, setMapReady] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{ code: string; name: string } | null>(null);
  const [countrySummaryCache, setCountrySummaryCache] = useState<Record<string, EntityHoverSummary>>({});

  const countryData = useMemo(() => normalizeGeoJsonFeatures(countriesGeoJson), []);
  const diagnostics = countryData.diagnostics;
  const countryCount = countryData.features.length;
  const countriesCollection = useMemo(
    () => buildCountryFeatureCollection(countryData.features),
    [countryData.features],
  );
  const markersCollection = useMemo(() => buildMarkersFeatureCollection(markers), [markers]);
  const activeCountryCollection = useMemo(
    () => buildActiveCountryFeatureCollection(countriesCollection, hoveredCountry?.code ?? null, selectedCountryCode ?? null),
    [countriesCollection, hoveredCountry?.code, selectedCountryCode],
  );
  const statusTone = useMemo(() => buildStatusTone(palette), [palette]);

  useEffect(() => {
    setPalette(buildThemePalette());
  }, []);

  useEffect(() => {
    onHoverMarkerRef.current = onHoverMarker;
  }, [onHoverMarker]);

  useEffect(() => {
    onSelectMarkerRef.current = onSelectMarker;
  }, [onSelectMarker]);

  useEffect(() => {
    onSelectCountryRef.current = onSelectCountry;
  }, [onSelectCountry]);

  useEffect(() => {
    console.log("[MapboxInfrastructureGlobe] country polygon source", {
      sourceKind: diagnostics.sourceKind,
      totalFeatures: diagnostics.totalFeatures,
      polygonCount: diagnostics.polygonFeatures,
      totalPoints: diagnostics.totalPoints,
      renderedPoints: diagnostics.renderedPoints,
      firstFeature: diagnostics.firstFeature,
      markerCount: markers.length,
    });
  }, [diagnostics, markers.length]);

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      setSetupError("Mapbox renderer needs a Vite access token in VITE_MAPBOX_ACCESS_TOKEN.");
      return;
    }

    if (!containerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;
    let mapInstance: MapboxMap | null = null;

    async function initializeMap(): Promise<void> {
      try {
        const mapboxModule = (await import("mapbox-gl")) as MapboxModule;

        if (!isMounted || !containerRef.current) {
          return;
        }

        mapboxModule.default.accessToken = MAPBOX_ACCESS_TOKEN;

        mapInstance = new mapboxModule.default.Map({
          container: containerRef.current,
          style: MAPBOX_STYLE,
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          projection: "globe",
          attributionControl: false,
          dragRotate: true,
          scrollZoom: true,
          doubleClickZoom: true,
          touchZoomRotate: true,
          touchPitch: true,
          keyboard: true,
          pitchWithRotate: true,
          cooperativeGestures: false,
        });

        mapRef.current = mapInstance;

        mapInstance.on("style.load", () => {
          if (!isMounted || !mapInstance) {
            return;
          }

          mapInstance.setFog({
            color: "rgb(6, 18, 32)",
            "high-color": "rgb(33, 72, 103)",
            "horizon-blend": 0.08,
            "space-color": "rgb(2, 8, 16)",
            "star-intensity": 0.1,
          });

          mapInstance.addSource(BASE_COUNTRIES_SOURCE_ID, {
            type: "geojson",
            data: countriesCollection,
          });

          mapInstance.addSource(ACTIVE_COUNTRY_SOURCE_ID, {
            type: "geojson",
            data: activeCountryCollection,
          });

          mapInstance.addSource(MARKERS_SOURCE_ID, {
            type: "geojson",
            data: markersCollection,
          });

          mapInstance.addLayer({
            id: BASE_COUNTRIES_LAYER_ID,
            type: "fill",
            source: BASE_COUNTRIES_SOURCE_ID,
            paint: {
              "fill-color": palette.land,
              "fill-opacity": 0.78,
            },
          });

          mapInstance.addLayer({
            id: ACTIVE_COUNTRY_LAYER_ID,
            type: "fill",
            source: ACTIVE_COUNTRY_SOURCE_ID,
            paint: {
              "fill-color": [
                "case",
                ["==", ["get", "countryCode"], selectedCountryCode ?? ""],
                palette.landSelected,
                palette.landHovered,
              ],
              "fill-opacity": 0.95,
            },
          });

          mapInstance.addLayer({
            id: COUNTRY_BORDERS_LAYER_ID,
            type: "line",
            source: BASE_COUNTRIES_SOURCE_ID,
            paint: {
              "line-color": palette.border,
              "line-width": 0.8,
            },
          });

          mapInstance.addLayer({
            id: MARKERS_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            paint: {
              "circle-color": [
                "match",
                ["get", "healthStatus"],
                "Healthy",
                statusTone.Healthy,
                "Warning",
                statusTone.Warning,
                "Critical",
                statusTone.Critical,
                "Offline",
                statusTone.Offline,
                "Maintenance",
                statusTone.Maintenance,
                statusTone.Healthy,
              ],
              "circle-radius": [
                "case",
                ["==", ["get", "id"], selectedMarkerId ?? ""],
                9,
                ["==", ["get", "healthStatus"], "Critical"],
                7,
                ["==", ["get", "healthStatus"], "Warning"],
                6,
                5,
              ],
              "circle-stroke-color": "rgba(255,255,255,0.9)",
              "circle-stroke-width": [
                "case",
                ["==", ["get", "id"], selectedMarkerId ?? ""],
                2.5,
                1.4,
              ],
              "circle-opacity": 0.98,
            },
          });

          mapInstance.addLayer({
            id: SELECTED_MARKER_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            filter: ["==", ["get", "id"], selectedMarkerId ?? ""],
            paint: {
              "circle-radius": 14,
              "circle-color": "rgba(255,255,255,0.08)",
              "circle-stroke-color": palette.borderActive,
              "circle-stroke-width": 2,
            },
          });

          function handleCountryHover(event: import("mapbox-gl").MapLayerMouseEvent): void {
            const feature = event.features?.[0];
            const properties = feature?.properties as CountryFeatureProperties | undefined;

            if (!properties) {
              return;
            }

            mapInstance?.getCanvas().style.setProperty("cursor", "pointer");
            setHoveredCountry((previous) => {
              if (previous?.code === properties.countryCode && previous.name === properties.countryName) {
                return previous;
              }

              return {
                code: properties.countryCode,
                name: properties.countryName,
              };
            });
          }

          function handleCountryLeave(): void {
            mapInstance?.getCanvas().style.setProperty("cursor", "");
            setHoveredCountry(null);
          }

          function handleCountryClick(event: import("mapbox-gl").MapLayerMouseEvent): void {
            const feature = event.features?.[0];
            const properties = feature?.properties as CountryFeatureProperties | undefined;

            if (!properties) {
              return;
            }

            onSelectCountryRef.current?.(properties.countryCode);
          }

          function handleMarkerHover(event: import("mapbox-gl").MapLayerMouseEvent): void {
            const properties = event.features?.[0]?.properties as MarkerFeatureProperties | undefined;

            if (!properties) {
              return;
            }

            mapInstance?.getCanvas().style.setProperty("cursor", "pointer");

            if (hoveredMarkerIdRef.current === properties.id) {
              return;
            }

            hoveredMarkerIdRef.current = properties.id;
            onHoverMarkerRef.current(properties.id);
          }

          function handleMarkerLeave(): void {
            mapInstance?.getCanvas().style.setProperty("cursor", "");

            if (!hoveredMarkerIdRef.current) {
              return;
            }

            hoveredMarkerIdRef.current = null;
            onHoverMarkerRef.current(null);
          }

          function handleMarkerClick(event: import("mapbox-gl").MapLayerMouseEvent): void {
            const properties = event.features?.[0]?.properties as MarkerFeatureProperties | undefined;

            if (!properties) {
              return;
            }

            onSelectMarkerRef.current(properties.id);
          }

          [BASE_COUNTRIES_LAYER_ID, ACTIVE_COUNTRY_LAYER_ID].forEach((layerId) => {
            mapInstance?.on("mousemove", layerId, handleCountryHover);
            mapInstance?.on("mouseleave", layerId, handleCountryLeave);
            mapInstance?.on("click", layerId, handleCountryClick);
          });

          [MARKERS_LAYER_ID, SELECTED_MARKER_LAYER_ID].forEach((layerId) => {
            mapInstance?.on("mousemove", layerId, handleMarkerHover);
            mapInstance?.on("mouseleave", layerId, handleMarkerLeave);
            mapInstance?.on("click", layerId, handleMarkerClick);
          });

          setMapReady(true);
          setSetupError(null);
        });

        mapInstance.on("error", (event) => {
          console.error("[MapboxInfrastructureGlobe] map error", event.error);

          if (!isMounted) {
            return;
          }

          setSetupError("Mapbox could not finish loading the globe renderer.");
        });

        resizeObserverRef.current = new ResizeObserver(() => {
          mapInstance?.resize();
        });

        resizeObserverRef.current.observe(containerRef.current);
      } catch (error) {
        console.error("[MapboxInfrastructureGlobe] setup failed", error);

        if (!isMounted) {
          return;
        }

        setSetupError("Mapbox package could not be loaded. Run npm install after pulling this change.");
      }
    }

    initializeMap();

    return () => {
      isMounted = false;

      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      mapInstance?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) {
      return;
    }

    updateGeoJsonSource(map, BASE_COUNTRIES_SOURCE_ID, countriesCollection);
    updateGeoJsonSource(map, ACTIVE_COUNTRY_SOURCE_ID, activeCountryCollection);
    updateGeoJsonSource(map, MARKERS_SOURCE_ID, markersCollection);

    if (map.getLayer(BASE_COUNTRIES_LAYER_ID)) {
      map.setPaintProperty(BASE_COUNTRIES_LAYER_ID, "fill-color", palette.land);
    }

    if (map.getLayer(ACTIVE_COUNTRY_LAYER_ID)) {
      map.setPaintProperty(ACTIVE_COUNTRY_LAYER_ID, "fill-color", [
        "case",
        ["==", ["get", "countryCode"], selectedCountryCode ?? ""],
        palette.landSelected,
        palette.landHovered,
      ]);
    }

    if (map.getLayer(COUNTRY_BORDERS_LAYER_ID)) {
      map.setPaintProperty(COUNTRY_BORDERS_LAYER_ID, "line-color", palette.border);
    }

    if (map.getLayer(MARKERS_LAYER_ID)) {
      map.setPaintProperty(MARKERS_LAYER_ID, "circle-color", [
        "match",
        ["get", "healthStatus"],
        "Healthy",
        statusTone.Healthy,
        "Warning",
        statusTone.Warning,
        "Critical",
        statusTone.Critical,
        "Offline",
        statusTone.Offline,
        "Maintenance",
        statusTone.Maintenance,
        statusTone.Healthy,
      ]);

      map.setPaintProperty(MARKERS_LAYER_ID, "circle-radius", [
        "case",
        ["==", ["get", "id"], selectedMarkerId ?? ""],
        9,
        ["==", ["get", "healthStatus"], "Critical"],
        7,
        ["==", ["get", "healthStatus"], "Warning"],
        6,
        5,
      ]);

      map.setPaintProperty(MARKERS_LAYER_ID, "circle-stroke-width", [
        "case",
        ["==", ["get", "id"], selectedMarkerId ?? ""],
        2.5,
        1.4,
      ]);
    }

    if (map.getLayer(SELECTED_MARKER_LAYER_ID)) {
      map.setFilter(SELECTED_MARKER_LAYER_ID, ["==", ["get", "id"], selectedMarkerId ?? ""]);
      map.setPaintProperty(SELECTED_MARKER_LAYER_ID, "circle-stroke-color", palette.borderActive);
    }
  }, [activeCountryCollection, countriesCollection, mapReady, markersCollection, palette, selectedCountryCode, selectedMarkerId, statusTone]);

  useEffect(() => {
    const map = mapRef.current;
    const selectedCoordinates = getSelectedMarkerCoordinates(markers, selectedMarkerId);

    if (!map || !mapReady || !selectedCoordinates) {
      return;
    }

    map.easeTo({
      center: selectedCoordinates,
      zoom: 2.2,
      duration: 900,
      essential: true,
    });
  }, [mapReady, markers, selectedMarkerId]);

  useEffect(() => {
    if (!hoveredMarkerId) {
      hoveredMarkerIdRef.current = null;
    }
  }, [hoveredMarkerId]);

  const activeCountryCode = hoveredCountry?.code ?? selectedCountryCode ?? null;
  const activeMarker = markers.find((marker) => marker.id === hoveredMarkerId) ?? null;
  const markerSummary = activeMarker ? markerToSummary(activeMarker, regionLookup) : null;
  const countrySummary = activeCountryCode ? countrySummaryCache[activeCountryCode] : null;
  const selectedOrHoveredSummary = markerSummary ?? countrySummary;

  useEffect(() => {
    if (!activeCountryCode || countrySummaryCache[activeCountryCode]) {
      return;
    }

    async function loadCountrySummary(): Promise<void> {
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
    }

    loadCountrySummary();
  }, [activeCountryCode, countrySummaryCache]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/10 sm:h-[440px] xl:h-[520px]">
        <div ref={containerRef} className="h-full w-full" />

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
          <div className="absolute bottom-3 left-3 z-20 rounded-md border border-border bg-background/95 px-2.5 py-1.5 text-xs text-muted-foreground">
            No site markers available for current filters.
          </div>
        ) : null}

        {!setupError && mapReady ? (
          <div className="absolute bottom-3 left-3 right-3 z-20 rounded-md border border-border bg-background/92 px-3 py-2 text-[11px] text-muted-foreground shadow-sm sm:left-auto sm:right-3">
            Drag to spin · Scroll to zoom · Right-drag to tilt
          </div>
        ) : null}

        {setupError ? (
          <div className="absolute inset-3 z-30 flex items-center justify-center rounded-lg border border-dashed border-warning/60 bg-background/96 p-6">
            <div className="max-w-md space-y-3 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                {MAPBOX_ACCESS_TOKEN ? <Map className="h-5 w-5 text-foreground" /> : <KeyRound className="h-5 w-5 text-foreground" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Mapbox globe is not ready yet</p>
                <p className="mt-1 text-xs text-muted-foreground">{setupError}</p>
              </div>
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-left text-[11px] text-muted-foreground">
                Add `VITE_MAPBOX_ACCESS_TOKEN` to your environment and run `npm install` so the `mapbox-gl` package is available locally.
              </div>
            </div>
          </div>
        ) : null}

        {!setupError && !mapReady ? (
          <div className="absolute inset-x-3 bottom-3 z-20 rounded-md border border-border bg-background/92 px-3 py-2 text-xs text-muted-foreground shadow-sm">
            Initializing Mapbox globe renderer…
          </div>
        ) : null}
      </div>
    </div>
  );
}
