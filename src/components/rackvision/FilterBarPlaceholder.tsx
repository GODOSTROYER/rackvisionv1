import { SlidersHorizontal } from "lucide-react";
import { ActiveFilterChips } from "@/components/rackvision/ActiveFilterChips";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FilterBarPlaceholder() {
  const { state, dispatch } = useRackVision();

  const updateFilters = (next: typeof state.activeFilters) => {
    dispatch({ type: "SET_ACTIVE_FILTERS", payload: next });
    dispatch({ type: "SET_HIGHLIGHT_CRITICAL_ONLY", payload: next.criticalOnly });
  };

  const clearAll = () => {
    dispatch({ type: "CLEAR_ACTIVE_FILTERS" });
    dispatch({ type: "SET_HIGHLIGHT_CRITICAL_ONLY", payload: false });
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-2">
      <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" /> RackVision Filters
      </div>
      <Select
        value={state.activeFilters.status}
        onValueChange={(value) => updateFilters({ ...state.activeFilters, status: value as typeof state.activeFilters.status })}
      >
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
        value={state.activeFilters.deviceType}
        onValueChange={(value) => updateFilters({ ...state.activeFilters, deviceType: value as typeof state.activeFilters.deviceType })}
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
          <SelectItem value="PDU">PDU</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={state.activeFilters.alertSeverity}
        onValueChange={(value) => updateFilters({ ...state.activeFilters, alertSeverity: value as typeof state.activeFilters.alertSeverity })}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Alert severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Alerts</SelectItem>
          <SelectItem value="warning">Warning+</SelectItem>
          <SelectItem value="critical">Critical only</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={state.activeFilters.occupancyRange}
        onValueChange={(value) => updateFilters({ ...state.activeFilters, occupancyRange: value as typeof state.activeFilters.occupancyRange })}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Occupancy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Occupancy</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant={state.activeFilters.criticalOnly ? "default" : "outline"}
        onClick={() => updateFilters({ ...state.activeFilters, criticalOnly: !state.activeFilters.criticalOnly })}
      >
        Critical only
      </Button>
      <Button
        size="sm"
        variant={state.activeFilters.offlineOnly ? "default" : "outline"}
        onClick={() => updateFilters({ ...state.activeFilters, offlineOnly: !state.activeFilters.offlineOnly })}
      >
        Offline only
      </Button>
      </div>
      <ActiveFilterChips filters={state.activeFilters} onFiltersChange={updateFilters} onClearAll={clearAll} />
    </div>
  );
}
