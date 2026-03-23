import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { RackVisionView } from "@/components/rackvision/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const views: { value: RackVisionView; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "hierarchy", label: "Hierarchy" },
  { value: "site", label: "Site" },
  { value: "rack", label: "Rack" },
];

export function ViewModeSwitchPlaceholder() {
  const { state, dispatch } = useRackVision();

  return (
    <Tabs value={state.activeView} onValueChange={(next) => dispatch({ type: "SET_ACTIVE_VIEW", payload: next as RackVisionView })}>
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-card p-1">
        {views.map((view) => (
          <TabsTrigger key={view.value} value={view.value} className="text-xs md:text-sm">
            {view.label} View
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
