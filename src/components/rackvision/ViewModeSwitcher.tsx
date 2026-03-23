import { RackVisionViewMode } from "@/components/rackvision/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const modes: { value: RackVisionViewMode; label: string }[] = [
  { value: "global", label: "Global View" },
  { value: "hierarchy", label: "Hierarchy View" },
  { value: "rack", label: "Rack View" },
  { value: "layout", label: "Layout View" },
  { value: "split", label: "Split View" },
];

type ViewModeSwitcherProps = {
  value: RackVisionViewMode;
  onValueChange: (value: RackVisionViewMode) => void;
};

export function ViewModeSwitcher({ value, onValueChange }: ViewModeSwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as RackVisionViewMode)}>
      <TabsList className="w-full flex-wrap justify-start h-auto gap-1">
        {modes.map((mode) => (
          <TabsTrigger key={mode.value} value={mode.value} className="text-xs md:text-sm">
            {mode.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
