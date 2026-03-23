import { LayoutGrid, Network, Rows3, ServerCog, TreePine } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { RackVisionViewMode } from "@/components/rackvision/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const modes: Array<{ value: RackVisionViewMode; label: string; icon: typeof Network }> = [
  { value: "global", label: "Global", icon: Network },
  { value: "hierarchy", label: "Hierarchy", icon: TreePine },
  { value: "site", label: "Site", icon: LayoutGrid },
  { value: "rack", label: "Rack", icon: ServerCog },
  { value: "layout", label: "Layout", icon: Rows3 },
];

export function RackVisionViewModeSwitcher() {
  const { state, dispatch } = useRackVision();

  return (
    <Tabs value={state.activeView} onValueChange={(next) => dispatch({ type: "SET_ACTIVE_VIEW", payload: next as RackVisionViewMode })}>
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-card p-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <TabsTrigger key={mode.value} value={mode.value} className="inline-flex items-center gap-1 text-xs md:text-sm">
              <Icon className="h-3.5 w-3.5" /> {mode.label} View
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
