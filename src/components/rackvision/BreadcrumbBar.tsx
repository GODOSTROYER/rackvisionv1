import { ChevronRight } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";

type BreadcrumbBarProps = {
  onSelectBreadcrumb: (id: string) => void;
};

export function BreadcrumbBar({ onSelectBreadcrumb }: BreadcrumbBarProps) {
  const { state } = useRackVision();

  return (
    <nav aria-label="RackVision breadcrumb" className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
      {state.breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          <button
            type="button"
            className="rounded px-1 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onSelectBreadcrumb(crumb.id)}
            aria-current={index === state.breadcrumbs.length - 1 ? "page" : undefined}
          >
            <span className={index === state.breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>{crumb.label}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
