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
    firstFeature: GeoJsonFeature | null;
  };
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeGeoJsonFeatures(source: unknown): NormalizedGeoJsonResult {
  const sourceKind: NormalizedGeoJsonResult["diagnostics"]["sourceKind"] = Array.isArray(source)
    ? "feature_array"
    : isRecord(source) && Array.isArray((source as GeoJsonCollectionLike).features)
      ? "feature_collection"
      : "invalid";

  const rawFeatures = Array.isArray(source)
    ? source
    : isRecord(source) && Array.isArray((source as GeoJsonCollectionLike).features)
      ? ((source as GeoJsonCollectionLike).features as unknown[])
      : [];

  const polygonFeatures = rawFeatures.filter((feature): feature is GeoJsonFeature => {
    if (!isRecord(feature)) return false;
    const geometryType = isRecord(feature.geometry) ? feature.geometry.type : undefined;
    return geometryType === "Polygon" || geometryType === "MultiPolygon";
  });

  return {
    features: polygonFeatures,
    diagnostics: {
      sourceKind,
      totalFeatures: rawFeatures.length,
      polygonFeatures: polygonFeatures.length,
      firstFeature: polygonFeatures[0] ?? null,
    },
  };
}
