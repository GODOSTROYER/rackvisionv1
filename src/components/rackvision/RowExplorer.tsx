import { RowCard } from "@/components/rackvision/RowCard";
import { RowSummary } from "@/components/rackvision/types";

type RowExplorerProps = {
  rows: RowSummary[];
  selectedRowId: string | null;
  onSelectRow: (rowId: string) => void;
};

export function RowExplorer({ rows, selectedRowId, onSelectRow }: RowExplorerProps) {
  if (!rows.length) return null;

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Row Explorer</p>
      <div className="grid gap-2 md:grid-cols-2">
        {rows.map((row) => (
          <RowCard key={row.rowId} row={row} selected={selectedRowId === row.rowId} onSelect={onSelectRow} />
        ))}
      </div>
    </section>
  );
}
