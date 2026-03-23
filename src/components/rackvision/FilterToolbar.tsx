import { Button } from "@/components/ui/button";

type FilterToolbarProps = {
  healthyOnly: boolean;
  warningCriticalOnly: boolean;
  offlineOnly: boolean;
  showEmptySlots: boolean;
  showNetworkDevices: boolean;
  showStorageDevices: boolean;
  onToggle: (key: "healthyOnly" | "warningCriticalOnly" | "offlineOnly" | "showEmptySlots" | "showNetworkDevices" | "showStorageDevices") => void;
};

const chips: { label: string; key: FilterToolbarProps["onToggle"] extends (k: infer K) => void ? K : never }[] = [
  { label: "Healthy only", key: "healthyOnly" },
  { label: "Warning/Critical", key: "warningCriticalOnly" },
  { label: "Offline only", key: "offlineOnly" },
  { label: "Show empty slots", key: "showEmptySlots" },
  { label: "Show network devices", key: "showNetworkDevices" },
  { label: "Show storage devices", key: "showStorageDevices" },
];

export function FilterToolbar(props: FilterToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          variant={props[chip.key] ? "default" : "outline"}
          size="sm"
          onClick={() => props.onToggle(chip.key)}
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
