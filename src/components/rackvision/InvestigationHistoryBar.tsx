import { History, RotateCcw } from "lucide-react";
import { InvestigationHistoryEntry } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";

type InvestigationHistoryBarProps = {
  history: InvestigationHistoryEntry[];
  onSelect: (entry: InvestigationHistoryEntry) => void;
  onClear: () => void;
};

export function InvestigationHistoryBar({ history, onSelect, onClear }: InvestigationHistoryBarProps) {
  if (!history.length) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
          <History className="h-3.5 w-3.5 text-muted-foreground" /> Investigation History
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClear}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="inline-flex items-center rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[11px] text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onSelect(entry)}
          >
            {entry.label}
            <span className="ml-1 text-muted-foreground">· {entry.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
