import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, KeyRound, ListChecks, Map } from "lucide-react";
import { EntityHoverSummaryCard } from "@/components/rackvision/EntityHoverSummaryCard";
import {
  buildStatusTone,
  buildThemePalette,
  defaultGlobePalette,
  markerToSummary,
  normalizeCountryCode,
  type GlobePalette,
} from "@/components/rackvision/globeShared";
import type { EntityHoverSummary, GlobeMarker, HealthStatus } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
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
  onMapboxUnavailable?: () => void;
  onOpenAlertsForScope?: (scope: { markerId?: string; countryCode?: string }) => void;
  onOpenTopSiteInCountry?: (countryCode: string) => void;
  onOpenTopRackInSite?: (siteId: string) => void;
  regionLookup: Record<string, string>;
};

type MapboxModule = typeof import("mapbox-gl");
type MapboxMap = import("mapbox-gl").Map;
type MapboxGeoJsonSource = import("mapbox-gl").GeoJSONSource;

type CountryFeature = GeoJsonFeature;

type CountryFeatureProperties = {
  countryCode: string;
  countryName: string;
  riskScore: number;
  criticalAlerts: number;
  warningAlerts: number;
  offlineSites: number;
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

type CountryRisk = {
  riskScore: number;
  criticalAlerts: number;
  warningAlerts: number;
  offlineSites: number;
};

const BASE_COUNTRIES_SOURCE_ID = "rackvision-countries";
const ACTIVE_COUNTRY_SOURCE_ID = "rackvision-active-country";
const MARKERS_SOURCE_ID = "rackvision-markers";
const BASE_COUNTRIES_LAYER_ID = "rackvision-countries-fill";
const ACTIVE_COUNTRY_LAYER_ID = "rackvision-active-country-fill";
const COUNTRY_BORDERS_LAYER_ID = "rackvision-country-borders";
const MARKER_CLUSTER_LAYER_ID = "rackvision-marker-clusters";
const MARKER_CLUSTER_COUNT_LAYER_ID = "rackvision-marker-cluster-count";
const MARKERS_LAYER_ID = "rackvision-markers-circle";
const MARKER_PULSE_LAYER_ID = "rackvision-marker-pulse";
const SELECTED_MARKER_LAYER_ID = "rackvision-selected-marker-circle";
const MAPBOX_STYLE = import.meta.env.VITE_RACKVISION_MAPBOX_STYLE?.trim() || "mapbox://styles/mapbox/dark-v11";
const INITIAL_CENTER: [number, number] = [12, 20];
const INITIAL_ZOOM = 0.95;
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? "";

function getCountryIdentity(feature: CountryFeature): Pick<CountryFeatureProperties, "countryCode" | "countryName"> {
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

function getSeverityScore(status: HealthStatus): number {
  if (status === "Critical") return 4;
  if (status === "Offline") return 3;
  if (status === "Warning") return 2;
  if (status === "Maintenance") return 1;
  return 0;
}

function buildCountryRiskMap(markers: GlobeMarker[]): Record<string, CountryRisk> {
  return markers.reduce<Record<string, CountryRisk>>((accumulator, marker) => {
    const code = normalizeCountryCode(marker.country ?? "Unknown", "");
    const existing = accumulator[code] ?? { riskScore: 0, criticalAlerts: 0, warningAlerts: 0, offlineSites: 0 };
    const severityScore = getSeverityScore(marker.healthStatus);

    accumulator[code] = {
      riskScore: existing.riskScore + (marker.metrics.critical * 3 + marker.metrics.warning + severityScore),
      criticalAlerts: existing.criticalAlerts + marker.metrics.critical,
      warningAlerts: existing.warningAlerts + marker.metrics.warning,
      offlineSites: existing.offlineSites + (marker.healthStatus === "Offline" ? 1 : 0),
    };

    return accumulator;
  }, {});
}

function buildCountryFeatureCollection(
  features: CountryFeature[],
  countryRiskMap: Record<string, CountryRisk>,
): FeatureCollection<CountryFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: features.map((feature, index) => {
      const identity = getCountryIdentity(feature);
      const risk = countryRiskMap[identity.countryCode] ?? {
        riskScore: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        offlineSites: 0,
      };

      return {
        type: "Feature",
        id: identity.countryCode || index,
        properties: {
          ...identity,
          riskScore: risk.riskScore,
          criticalAlerts: risk.criticalAlerts,
          warningAlerts: risk.warningAlerts,
          offlineSites: risk.offlineSites,
        },
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

function getGeometryBounds(
  geometry: CountryFeature["geometry"],
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
): void {
  if (geometry.type === "Polygon") {
    geometry.coordinates.flat().forEach(([lng, lat]) => {
      bounds.minLng = Math.min(bounds.minLng, lng);
      bounds.maxLng = Math.max(bounds.maxLng, lng);
      bounds.minLat = Math.min(bounds.minLat, lat);
      bounds.maxLat = Math.max(bounds.maxLat, lat);
    });
    return;
  }

  if (geometry.type === "MultiPolygon") {
    geometry.coordinates.flat(2).forEach(([lng, lat]) => {
      bounds.minLng = Math.min(bounds.minLng, lng);
      bounds.maxLng = Math.max(bounds.maxLng, lng);
      bounds.minLat = Math.min(bounds.minLat, lat);
      bounds.maxLat = Math.max(bounds.maxLat, lat);
    });
  }
}

export function MapboxInfrastructureGlobe({
  markers,
  selectedMarkerId,
  hoveredMarkerId,
  selectedCountryCode,
  onHoverMarker,
  onSelectMarker,
  onSelectCountry,
  onMapboxUnavailable,
  onOpenAlertsForScope,
  onOpenTopSiteInCountry,
  onOpenTopRackInSite,
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
  const [countrySummaryLoading, setCountrySummaryLoading] = useState<string | null>(null);

  const countryData = useMemo(() => normalizeGeoJsonFeatures(countriesGeoJson), []);
  const diagnostics = countryData.diagnostics;
  const countryCount = countryData.features.length;
  const countryRiskMap = useMemo(() => buildCountryRiskMap(markers), [markers]);
  const countriesCollection = useMemo(
    () => buildCountryFeatureCollection(countryData.features, countryRiskMap),
    [countryData.features, countryRiskMap],
  );
  const markersCollection = useMemo(() => buildMarkersFeatureCollection(markers), [markers]);
  const activeCountryCollection = useMemo(
    () => buildActiveCountryFeatureCollection(countriesCollection, hoveredCountry?.code ?? null, selectedCountryCode ?? null),
    [countriesCollection, hoveredCountry?.code, selectedCountryCode],
  );
  const statusTone = useMemo(() => buildStatusTone(palette), [palette]);

  const visibleSites = markers.filter((marker) => marker.kind === "site").length;
  const criticalAlerts = markers.reduce((acc, marker) => acc + marker.metrics.critical, 0);
  const countriesAtRisk = useMemo(
    () => Object.values(countryRiskMap).filter((risk) => risk.riskScore > 0).length,
    [countryRiskMap],
  );

  const sortedSiteMarkers = useMemo(
    () => [...markers].sort((a, b) => b.metrics.critical - a.metrics.critical || b.metrics.activeAlerts - a.metrics.activeAlerts),
    [markers],
  );

  const selectedMarker = useMemo(() => markers.find((marker) => marker.id === selectedMarkerId) ?? null, [markers, selectedMarkerId]);

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
    if (!MAPBOX_ACCESS_TOKEN) {
      setSetupError("Mapbox renderer needs a Vite access token in VITE_MAPBOX_ACCESS_TOKEN.");
      onMapboxUnavailable?.();
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
            color: "rgb(8, 15, 26)",
            "high-color": "rgb(31, 59, 86)",
            "horizon-blend": 0.12,
            "space-color": "rgb(2, 8, 16)",
            "star-intensity": 0.05,
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
            cluster: true,
            clusterMaxZoom: 5,
            clusterRadius: 48,
            clusterProperties: {
              criticalSum: ["+", ["coalesce", ["get", "critical"], 0]],
              warningSum: ["+", ["coalesce", ["get", "warning"], 0]],
            },
          });

          mapInstance.addLayer({
            id: BASE_COUNTRIES_LAYER_ID,
            type: "fill",
            source: BASE_COUNTRIES_SOURCE_ID,
            paint: {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["get", "riskScore"], 0],
                0,
                "rgba(77, 115, 141, 0.66)",
                3,
                "rgba(212, 143, 48, 0.56)",
                8,
                "rgba(220, 60, 60, 0.62)",
              ],
              "fill-opacity": 0.82,
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
              "fill-opacity": 0.96,
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
            id: MARKER_CLUSTER_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["coalesce", ["get", "criticalSum"], 0],
                "rgba(217, 146, 16, 0.72)",
                1,
                "rgba(220, 60, 60, 0.75)",
                4,
                "rgba(185, 39, 39, 0.84)",
              ],
              "circle-radius": ["step", ["get", "point_count"], 15, 4, 19, 10, 24],
              "circle-stroke-color": "rgba(255,255,255,0.8)",
              "circle-stroke-width": 1.3,
            },
          });

          mapInstance.addLayer({
            id: MARKER_CLUSTER_COUNT_LAYER_ID,
            type: "symbol",
            source: MARKERS_SOURCE_ID,
            filter: ["has", "point_count"],
            layout: {
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-size": 11,
            },
            paint: {
              "text-color": "rgba(255,255,255,0.96)",
            },
          });

          mapInstance.addLayer({
            id: MARKERS_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            filter: ["!", ["has", "point_count"]],
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
                10,
                ["==", ["get", "healthStatus"], "Critical"],
                8,
                ["==", ["get", "healthStatus"], "Warning"],
                6.8,
                5.2,
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
            id: MARKER_PULSE_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            filter: [
              "all",
              ["!", ["has", "point_count"]],
              ["any", ["==", ["get", "healthStatus"], "Critical"], ["==", ["get", "healthStatus"], "Warning"]],
            ],
            paint: {
              "circle-color": [
                "case",
                ["==", ["get", "healthStatus"], "Critical"],
                "rgba(220, 60, 60, 0.26)",
                "rgba(217, 146, 16, 0.24)",
              ],
              "circle-radius": [
                "case",
                ["==", ["get", "healthStatus"], "Critical"],
                17,
                14,
              ],
              "circle-opacity": 0.3,
            },
          });

          mapInstance.addLayer({
            id: SELECTED_MARKER_LAYER_ID,
            type: "circle",
            source: MARKERS_SOURCE_ID,
            filter: ["==", ["get", "id"], selectedMarkerId ?? ""],
            paint: {
              "circle-radius": 15,
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

          function handleClusterClick(event: import("mapbox-gl").MapLayerMouseEvent): void {
            const feature = event.features?.[0];
            const clusterId = feature?.properties?.cluster_id as number | undefined;
            const source = mapInstance?.getSource(MARKERS_SOURCE_ID) as MapboxGeoJsonSource | undefined;

            if (!source || clusterId === undefined) {
              return;
            }

            source.getClusterExpansionZoom(clusterId, (error, zoom) => {
              if (error || !feature.geometry || feature.geometry.type !== "Point" || !mapInstance) {
                return;
              }

              mapInstance.easeTo({
                center: feature.geometry.coordinates as [number, number],
                zoom,
                duration: 700,
                essential: true,
              });
            });
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

          mapInstance.on("click", MARKER_CLUSTER_LAYER_ID, handleClusterClick);

          setMapReady(true);
          setSetupError(null);
        });

        mapInstance.on("error", (event) => {
          console.error("[MapboxInfrastructureGlobe] map error", event.error);

          if (!isMounted) {
            return;
          }

          setSetupError("Mapbox could not finish loading the globe renderer.");
          onMapboxUnavailable?.();
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
        onMapboxUnavailable?.();
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

    if (map.getLayer(ACTIVE_COUNTRY_LAYER_ID)) {
      map.setPaintProperty(ACTIVE_COUNTRY_LAYER_ID, "fill-color", [
        "case",
        ["==", ["get", "countryCode"], selectedCountryCode ?? ""],
        palette.landSelected,
        palette.landHovered,
      ]);
    }

    if (map.getLayer(SELECTED_MARKER_LAYER_ID)) {
      map.setFilter(SELECTED_MARKER_LAYER_ID, ["==", ["get", "id"], selectedMarkerId ?? ""]);
      map.setPaintProperty(SELECTED_MARKER_LAYER_ID, "circle-stroke-color", palette.borderActive);
    }
  }, [activeCountryCollection, countriesCollection, mapReady, markersCollection, palette.borderActive, palette.landHovered, palette.landSelected, selectedCountryCode, selectedMarkerId]);

  useEffect(() => {
    const map = mapRef.current;
    const selectedCoordinates = getSelectedMarkerCoordinates(markers, selectedMarkerId);

    if (!map || !mapReady || !selectedCoordinates) {
      return;
    }

    map.easeTo({
      center: selectedCoordinates,
      zoom: 2.5,
      duration: 900,
      essential: true,
    });
  }, [mapReady, markers, selectedMarkerId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedCountryCode) return;

    const countryFeature = countriesCollection.features.find((feature) => feature.properties.countryCode === selectedCountryCode);
    if (!countryFeature) return;

    const bounds = { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity };
    getGeometryBounds(countryFeature.geometry as CountryFeature["geometry"], bounds);

    if ([bounds.minLng, bounds.maxLng, bounds.minLat, bounds.maxLat].some((value) => !Number.isFinite(value))) {
      return;
    }

    map.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: 44, maxZoom: 3.3, duration: 900, essential: true },
    );
  }, [countriesCollection.features, mapReady, selectedCountryCode]);

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
      setCountrySummaryLoading(activeCountryCode);
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
      setCountrySummaryLoading(null);
    }

    loadCountrySummary();
  }, [activeCountryCode, countrySummaryCache]);

  useEffect(() => {
    const candidateCountries = Object.entries(countryRiskMap)
      .sort(([, a], [, b]) => b.riskScore - a.riskScore)
      .slice(0, 4)
      .map(([countryCode]) => countryCode)
      .filter((countryCode) => !countrySummaryCache[countryCode]);

    if (!candidateCountries.length) return;

    const timer = window.setTimeout(() => {
      candidateCountries.forEach(async (countryCode) => {
        const summary = await MockDataService.getCountryInfrastructureSummary(countryCode);
        setCountrySummaryCache((previous) => {
          if (previous[countryCode]) return previous;
          return {
            ...previous,
            [countryCode]: {
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
          };
        });
      });
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countryRiskMap, countrySummaryCache]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getLayer(MARKER_PULSE_LAYER_ID)) return;

    let rafId = 0;
    let frame = 0;

    const animate = () => {
      frame += 1;
      const phase = (Math.sin(frame / 8) + 1) / 2;
      map.setPaintProperty(MARKER_PULSE_LAYER_ID, "circle-opacity", 0.18 + phase * 0.26);
      map.setPaintProperty(MARKER_PULSE_LAYER_ID, "circle-radius", [
        "case",
        ["==", ["get", "healthStatus"], "Critical"],
        14 + phase * 7,
        12 + phase * 5,
      ]);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [mapReady]);

  const topFailingSite = sortedSiteMarkers[0] ?? null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/75 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">Operational scope</span>
        <span>Visible sites: <span className="font-semibold text-foreground">{visibleSites}</span></span>
        <span>Critical alerts: <span className="font-semibold text-foreground">{criticalAlerts}</span></span>
        <span>Countries at risk: <span className="font-semibold text-foreground">{countriesAtRisk}</span></span>
        <span>Selected scope: <span className="font-semibold text-foreground">{selectedMarker?.name ?? activeCountryCode ?? "Global"}</span></span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
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
          ) : null}

          {selectedOrHoveredSummary ? (
            <div className="pointer-events-none absolute left-3 right-3 top-16 z-20 sm:left-auto sm:right-4 sm:top-4">
              <EntityHoverSummaryCard summary={selectedOrHoveredSummary} />
            </div>
          ) : null}

          {countrySummaryLoading === activeCountryCode ? (
            <div className="absolute right-3 top-3 z-20 rounded-md border border-border bg-background/92 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              Loading country summary…
            </div>
          ) : null}

          {!setupError && mapReady ? (
            <div className="absolute bottom-3 left-3 right-3 z-20 rounded-md border border-border bg-background/92 px-3 py-2 text-[11px] text-muted-foreground shadow-sm sm:left-auto sm:right-3">
              Drag to spin · Scroll to zoom · Right-drag to tilt · Click cluster to zoom risk hotspots
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
              </div>
            </div>
          ) : null}

          {!setupError && !mapReady ? (
            <div className="absolute inset-x-3 bottom-3 z-20 rounded-md border border-border bg-background/92 px-3 py-2 text-xs text-muted-foreground shadow-sm">
              Initializing Mapbox globe renderer…
            </div>
          ) : null}
        </div>

        <aside className="rounded-lg border border-border/70 bg-background/60 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" /> Scope navigator
          </div>

          <div className="space-y-2">
            {sortedSiteMarkers.slice(0, 8).map((marker) => (
              <button
                key={marker.id}
                type="button"
                className="w-full rounded-md border border-border/80 bg-card px-2.5 py-2 text-left text-xs hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => onSelectMarker(marker.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{marker.name}</span>
                  <span className="text-[10px] text-muted-foreground">{marker.healthStatus}</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{marker.city ?? "Unknown city"}, {marker.country ?? "Unknown"}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">Critical {marker.metrics.critical} · Alerts {marker.metrics.activeAlerts}</div>
              </button>
            ))}
            {!sortedSiteMarkers.length ? <p className="text-xs text-muted-foreground">No visible sites in current filters.</p> : null}
          </div>
        </aside>
      </div>

      {(selectedMarker || activeCountryCode) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/80 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Next action</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenAlertsForScope?.({ markerId: selectedMarker?.id, countryCode: activeCountryCode ?? undefined })}
          >
            Open alerts
          </Button>
          {activeCountryCode ? (
            <Button size="sm" variant="outline" onClick={() => onOpenTopSiteInCountry?.(activeCountryCode)}>
              Open top site
            </Button>
          ) : null}
          {selectedMarker ? (
            <Button size="sm" variant="outline" onClick={() => onOpenTopRackInSite?.(selectedMarker.id)}>
              Open affected rack
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
