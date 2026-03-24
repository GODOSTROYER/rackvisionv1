export type GeoJsonGeometryType = "Polygon" | "MultiPolygon";

export type GeoJsonFeature = {
  type?: string;
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
  properties?: Record<string, unknown>;
};

export type GeoJsonCollectionLike = {
  type?: string;
  features?: unknown;
};

export type NormalizedGeoJsonResult = {
  features: GeoJsonFeature[];
  diagnostics: {
    sourceKind: "feature_collection" | "feature_array" | "invalid";
    totalFeatures: number;
    polygonFeatures: number;
    totalPoints: number;
    renderedPoints: number;
    firstFeature: GeoJsonFeature | null;
  };
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getGeoJsonSourceKind(source: unknown): NormalizedGeoJsonResult["diagnostics"]["sourceKind"] {
  if (Array.isArray(source)) return "feature_array";
  if (isRecord(source) && Array.isArray((source as GeoJsonCollectionLike).features)) return "feature_collection";
  return "invalid";
}

function getRawFeatures(source: unknown): unknown[] {
  const sourceKind = getGeoJsonSourceKind(source);

  if (sourceKind === "feature_array") return source as unknown[];
  if (sourceKind === "feature_collection") return (source as GeoJsonCollectionLike).features as unknown[];
  return [];
}

function countRingPoints(ring: unknown): number {
  return Array.isArray(ring) ? ring.length : 0;
}

function countGeometryPoints(geometry: GeoJsonFeature["geometry"]): number {
  if (!isRecord(geometry) || !Array.isArray(geometry.coordinates)) return 0;
  if (geometry.type === "Polygon") {
    return geometry.coordinates.reduce((sum, ring) => sum + countRingPoints(ring), 0);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.reduce((sum, polygon) => {
      if (!Array.isArray(polygon)) return sum;
      return sum + polygon.reduce((polygonSum, ring) => polygonSum + countRingPoints(ring), 0);
    }, 0);
  }
  return 0;
}

function simplifyRing(ring: unknown, maxPoints: number): unknown {
  if (!Array.isArray(ring) || ring.length <= 4) return ring;

  const firstPoint = ring[0];
  const lastPoint = ring[ring.length - 1];
  const isClosed =
    Array.isArray(firstPoint) &&
    Array.isArray(lastPoint) &&
    firstPoint[0] === lastPoint[0] &&
    firstPoint[1] === lastPoint[1];

  const coreRing = isClosed ? ring.slice(0, -1) : ring.slice();
  if (coreRing.length <= maxPoints) return isClosed ? [...coreRing, coreRing[0]] : coreRing;

  const stride = Math.ceil(coreRing.length / maxPoints);
  const simplified = coreRing.filter((_, index) => index === 0 || index === coreRing.length - 1 || index % stride === 0);

  if (simplified.length < 3 && coreRing.length >= 3) {
    simplified.push(coreRing[Math.floor(coreRing.length / 2)]);
  }

  return isClosed ? [...simplified, simplified[0]] : simplified;
}

function simplifyGeometry(feature: GeoJsonFeature): GeoJsonFeature {
  const geometry = feature.geometry;
  if (!isRecord(geometry) || !Array.isArray(geometry.coordinates)) return feature;

  if (geometry.type === "Polygon") {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map((ring, index) => simplifyRing(ring, index === 0 ? 160 : 80)),
      },
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          Array.isArray(polygon) ? polygon.map((ring, index) => simplifyRing(ring, index === 0 ? 140 : 70)) : polygon,
        ),
      },
    };
  }

  return feature;
}

function isPolygonFeature(feature: unknown): feature is GeoJsonFeature {
  if (!isRecord(feature)) return false;
  const geometryType = isRecord(feature.geometry) ? feature.geometry.type : undefined;
  return geometryType === "Polygon" || geometryType === "MultiPolygon";
}

export function normalizeGeoJsonFeatures(source: unknown): NormalizedGeoJsonResult {
  const sourceKind = getGeoJsonSourceKind(source);
  const rawFeatures = getRawFeatures(source);
  const polygonFeatures = rawFeatures.filter(isPolygonFeature);

  const simplifiedFeatures = polygonFeatures.map(simplifyGeometry);
  const totalPoints = polygonFeatures.reduce((sum, feature) => sum + countGeometryPoints(feature.geometry), 0);
  const renderedPoints = simplifiedFeatures.reduce((sum, feature) => sum + countGeometryPoints(feature.geometry), 0);

  return {
    features: simplifiedFeatures,
    diagnostics: {
      sourceKind,
      totalFeatures: rawFeatures.length,
      polygonFeatures: polygonFeatures.length,
      totalPoints,
      renderedPoints,
      firstFeature: simplifiedFeatures[0] ?? null,
    },
  };
}
