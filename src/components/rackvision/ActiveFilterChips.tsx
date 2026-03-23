import { X } from "lucide-react";
import { RackVisionActiveFilters } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type ActiveFilterChipsProps = {
  filters: RackVisionActiveFilters;
  onFiltersChange: (next: RackVisionActiveFilters) => void;
  onClearAll: () => void;
};

type ChipDef = { key: keyof RackVisionActiveFilters; label: string; value: string | boolean };

const getChips = (filters: RackVisionActiveFilters): ChipDef[] => [
  { key: "status", label: "Status", value: filters.status },
  { key: "deviceType", label: "Device", value: filters.deviceType },
  { key: "regionId", label: "Region", value: filters.regionId },
  { key: "siteId", label: "Site", value: filters.siteId },
  { key: "roomId", label: "Room", value: filters.roomId },
  { key: "rowId", label: "Row", value: filters.rowId },
  { key: "alertSeverity", label: "Alerts", value: filters.alertSeverity },
  { key: "occupancyRange", label: "Occupancy", value: filters.occupancyRange },
  { key: "criticalOnly", label: "Critical", value: filters.criticalOnly },
  { key: "offlineOnly", label: "Offline", value: filters.offlineOnly },
];

export function ActiveFilterChips({ filters, onFiltersChange, onClearAll }: ActiveFilterChipsProps) {
  const chips = getChips(filters).filter((chip) => (typeof chip.value === "boolean" ? chip.value : chip.value !== "all"));

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground transition hover:border-primary"
          onClick={() => {
            const next = { ...filters };
            (next as Record<string, string | boolean>)[chip.key] = typeof chip.value === "boolean" ? false : "all";
            onFiltersChange(next);
          }}
        >
          {chip.label}: {String(chip.value)} <X className="h-3 w-3 text-muted-foreground" />
        </button>
      ))}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
