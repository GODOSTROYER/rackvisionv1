import { useEffect, useMemo, useState } from "react";
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
  const hasQuery = query.trim().length > 0;
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(results.length ? 0 : -1);
  }, [query, results]);

  const activeResult = useMemo(() => {
    if (activeIndex < 0 || activeIndex >= results.length) {
      return results[0] ?? null;
    }
    return results[activeIndex] ?? null;
  }, [activeIndex, results]);

  const selectResult = (result: RackVisionSearchResult | null) => {
    if (!result) return;
    onSelectResult(result);
    onOpenChange(false);
  };

  return (
    <div className="relative min-w-0 xl:col-span-2">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onFocus={() => onOpenChange(true)}
        onBlur={() => window.setTimeout(() => onOpenChange(false), 120)}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (!results.length && event.key !== "Escape") {
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            onOpenChange(false);
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            if (!open) onOpenChange(true);
            if (!results.length) return;

            setActiveIndex((current) => {
              if (event.key === "Home") return 0;
              if (event.key === "End") return results.length - 1;
              if (event.key === "ArrowDown") return Math.min((current < 0 ? 0 : current) + 1, results.length - 1);
              return Math.max((current < 0 ? 0 : current) - 1, 0);
            });
          }

          if (event.key === "Enter") {
            event.preventDefault();
            if (!results.length) return;
            selectResult(activeResult ?? results[0] ?? null);
          }
        }}
        placeholder="Search region, site, room, row, rack, hostname, IP"
        className="pl-8"
        role="combobox"
        aria-label="Search RackVision infrastructure"
        aria-expanded={open}
        aria-controls="rackvision-search-results"
        aria-autocomplete="list"
        aria-activedescendant={activeResult ? `rackvision-search-option-${activeResult.id}` : undefined}
      />
      {open && hasQuery ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30">
          <SearchResultsPanel query={query} results={results} activeResultId={activeResult?.id ?? null} onSelect={selectResult} />
        </div>
      ) : null}
    </div>
  );
}
