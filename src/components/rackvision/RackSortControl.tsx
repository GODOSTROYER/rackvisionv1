import { ArrowDownWideNarrow } from "lucide-react";
import { RackSortOption } from "@/components/rackvision/types";

type RackSortControlProps = {
  value: RackSortOption;
  onChange: (value: RackSortOption) => void;
};

export function RackSortControl({ value, onChange }: RackSortControlProps) {
  return (
    <label className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground sm:inline-flex sm:w-auto sm:justify-start">
      <ArrowDownWideNarrow className="h-3.5 w-3.5" />
      <span>Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RackSortOption)}
        className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none sm:flex-none"
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
