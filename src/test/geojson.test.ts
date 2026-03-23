import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeGeoJsonFeatures } from "@/lib/geojson";

const countriesGeoJson = JSON.parse(readFileSync(path.resolve(process.cwd(), "src/data/countries.json"), "utf-8"));

describe("normalizeGeoJsonFeatures", () => {
  it("accepts FeatureCollection datasets", () => {
    const result = normalizeGeoJsonFeatures(countriesGeoJson);

    expect(result.diagnostics.sourceKind).toBe("feature_collection");
    expect(result.diagnostics.totalFeatures).toBeGreaterThan(0);
    expect(result.diagnostics.polygonFeatures).toBeGreaterThan(0);
    expect(result.features[0]?.geometry?.type).toMatch(/Polygon/);
  });

  it("accepts plain feature arrays", () => {
    const source = [
      {
        type: "Feature",
        properties: { name: "Testland" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      },
    ];

    const result = normalizeGeoJsonFeatures(source);

    expect(result.diagnostics.sourceKind).toBe("feature_array");
    expect(result.features).toHaveLength(1);
  });

  it("rejects invalid datasets without crashing", () => {
    const result = normalizeGeoJsonFeatures({ hello: "world" });

    expect(result.diagnostics.sourceKind).toBe("invalid");
    expect(result.features).toHaveLength(0);
    expect(result.diagnostics.firstFeature).toBeNull();
  });
});
