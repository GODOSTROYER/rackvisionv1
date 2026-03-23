import { RackCard } from "@/components/rackvision/RackCard";
import { RackSummary } from "@/components/rackvision/types";

type RackGridPanelProps = {
  racks: RackSummary[];
  selectedRackId: string | null;
  onSelectRack: (rackId: string) => void;
  onOpenRack: (rackId: string) => void;
};

export function RackGridPanel({ racks, selectedRackId, onSelectRack, onOpenRack }: RackGridPanelProps) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rack Grid</p>
      <div className="grid gap-2 md:grid-cols-2">
        {racks.map((rack) => (
          <RackCard key={rack.rackId} rack={rack} selected={selectedRackId === rack.rackId} onSelect={onSelectRack} onOpen={onOpenRack} />
        ))}
      </div>
    </section>
  );
}
