import { SlidersHorizontal } from "lucide-react";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FilterBarPlaceholder() {
  const { state, dispatch } = useRackVision();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
      <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filter bar (Step 1)
      </div>
      <Select value={state.statusFilter} onValueChange={(value) => dispatch({ type: "SET_STATUS_FILTER", payload: value as typeof state.statusFilter })}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Healthy">Healthy</SelectItem>
          <SelectItem value="Warning">Warning</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
          <SelectItem value="Offline">Offline</SelectItem>
          <SelectItem value="Maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={state.deviceTypeFilter}
        onValueChange={(value) => dispatch({ type: "SET_DEVICE_TYPE_FILTER", payload: value as typeof state.deviceTypeFilter })}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Device type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Device Types</SelectItem>
          <SelectItem value="Server-1U">1U Server</SelectItem>
          <SelectItem value="Server-2U">2U Server</SelectItem>
          <SelectItem value="Appliance-4U">4U Appliance</SelectItem>
          <SelectItem value="Storage">Storage</SelectItem>
          <SelectItem value="Switch-ToR">ToR Switch</SelectItem>
          <SelectItem value="Firewall">Firewall</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
