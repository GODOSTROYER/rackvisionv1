import { SearchX } from "lucide-react";

type NoResultsStateProps = {
  title?: string;
  description?: string;
};

export function NoResultsState({ title = "No matching results", description = "Try a different query or clear some filters." }: NoResultsStateProps) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card">
          <SearchX className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
