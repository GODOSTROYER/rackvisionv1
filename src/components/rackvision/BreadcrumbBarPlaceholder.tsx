import { ChevronRight } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";

export function BreadcrumbBarPlaceholder() {
  const { state } = useRackVision();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
      {state.breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          <span className={index === state.breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>{crumb.label}</span>
        </div>
      ))}
    </div>
  );
}
