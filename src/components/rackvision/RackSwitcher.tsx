import { RackSummary } from "@/components/rackvision/types";

type RackSwitcherProps = {
  racks: RackSummary[];
  activeRackId: string;
  onSwitch: (rackId: string) => void;
};

export function RackSwitcher({ racks, activeRackId, onSwitch }: RackSwitcherProps) {
  return (
    <label className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground sm:w-auto sm:justify-start">
      Rack
      <select value={activeRackId} onChange={(event) => onSwitch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-foreground outline-none sm:flex-none">
        {racks.map((rack) => (
          <option key={rack.rackId} value={rack.rackId}>{rack.name}</option>
        ))}
      </select>
    </label>
  );
}
