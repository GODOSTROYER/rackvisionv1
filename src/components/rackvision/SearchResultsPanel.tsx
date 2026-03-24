import { EntityIcon } from "@/components/rackvision/EntityIcon";
import { NoResultsState } from "@/components/rackvision/NoResultsState";
import { RackVisionSearchResult } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type SearchResultsPanelProps = {
  query: string;
  results: RackVisionSearchResult[];
  activeResultId?: string | null;
  onSelect: (result: RackVisionSearchResult) => void;
};

export function SearchResultsPanel({ query, results, activeResultId, onSelect }: SearchResultsPanelProps) {
  if (!query.trim()) return null;
  if (!results.length) {
    return <NoResultsState title="No entities found" description="Search by site, rack, hostname, or IP address." />;
  }

  const groups = results.reduce<Record<string, RackVisionSearchResult[]>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  return (
    <div id="rackvision-search-results" className="max-h-[260px] overflow-auto rounded-lg border border-border bg-card p-2 shadow-sm sm:max-h-[340px]" role="listbox" aria-label="RackVision search results">
      <div className="space-y-2">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
            <div className="space-y-1">
              {groupItems.map((item) => (
                <button
                  key={item.id}
                  id={`rackvision-search-option-${item.id}`}
                  type="button"
                  onClick={() => onSelect(item)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  role="option"
                  aria-selected={activeResultId === item.id}
                  aria-label={`${item.name}, ${item.subtitle}`}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left transition",
                    activeResultId === item.id ? "border-primary/40 bg-primary/10" : "hover:border-border hover:bg-muted/30",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  )}
                >
                  <EntityIcon kind={item.kind} className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">{item.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{item.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
