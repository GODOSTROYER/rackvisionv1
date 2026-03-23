import { Search } from "lucide-react";
import { SearchResultsPanel } from "@/components/rackvision/SearchResultsPanel";
import { RackVisionSearchResult } from "@/components/rackvision/types";
import { Input } from "@/components/ui/input";

type GlobalSearchCommandProps = {
  query: string;
  results: RackVisionSearchResult[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelectResult: (result: RackVisionSearchResult) => void;
};

export function GlobalSearchCommand({ query, results, open, onOpenChange, onQueryChange, onSelectResult }: GlobalSearchCommandProps) {
  return (
    <div className="relative xl:col-span-2">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onFocus={() => onOpenChange(true)}
        onBlur={() => window.setTimeout(() => onOpenChange(false), 120)}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search region, site, room, row, rack, hostname, IP"
        className="pl-8"
      />
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30">
          <SearchResultsPanel query={query} results={results} onSelect={onSelectResult} />
        </div>
      ) : null}
    </div>
  );
}
