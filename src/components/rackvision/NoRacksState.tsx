import { ServerCrash } from "lucide-react";

export function NoRacksState() {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
          <ServerCrash className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No racks match this view</p>
        <p className="text-xs text-muted-foreground">Try adjusting search, filters, or row selection.</p>
      </div>
    </div>
  );
}
