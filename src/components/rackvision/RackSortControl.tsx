import { ArrowDownWideNarrow } from "lucide-react";
import { RackSortOption } from "@/components/rackvision/types";

type RackSortControlProps = {
  value: RackSortOption;
  onChange: (value: RackSortOption) => void;
};

export function RackSortControl({ value, onChange }: RackSortControlProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground">
      <ArrowDownWideNarrow className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RackSortOption)}
        className="bg-transparent text-xs text-foreground outline-none"
      >
        <option value="rack_id">Rack ID</option>
        <option value="occupancy">Occupancy %</option>
        <option value="alerts">Alert Count</option>
        <option value="health">Health Severity</option>
        <option value="temperature">Temperature</option>
        <option value="power">Power Load</option>
      </select>
    </label>
  );
}
