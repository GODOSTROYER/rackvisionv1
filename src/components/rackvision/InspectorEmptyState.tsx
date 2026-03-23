import { LayoutPanelRight } from "lucide-react";

export function InspectorEmptyState() {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
      <div className="space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
          <LayoutPanelRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No selection yet</p>
        <p className="max-w-xs text-xs text-muted-foreground">Pick any entity from the hierarchy to open contextual details and quick actions.</p>
      </div>
    </div>
  );
}
