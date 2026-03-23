import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { RoomLayoutPanel } from "@/components/rackvision/RoomLayoutPanel";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { LayoutViewModel, RackVisionEntityKind } from "@/components/rackvision/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MockDataService } from "@/services/rackvision/MockDataService";

type LayoutViewCanvasProps = {
  selectedEntityId: string | null;
  selectedEntityKind: RackVisionEntityKind | null;
  selectedSiteId: string | null;
  selectedRoomId: string | null;
  selectedRackId: string | null;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenRack: (id: string) => Promise<void>;
};

export function LayoutViewCanvas({
  selectedEntityId,
  selectedEntityKind,
  selectedSiteId,
  selectedRoomId,
  selectedRackId,
  onSelectEntity,
  onOpenRack,
}: LayoutViewCanvasProps) {
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<LayoutViewModel | null>(null);

  const scopeId = useMemo(() => {
    if (selectedEntityKind === "site" || selectedEntityKind === "room") return selectedEntityId;
    if (selectedRoomId) return selectedRoomId;
    if (selectedSiteId) return selectedSiteId;
    return null;
  }, [selectedEntityId, selectedEntityKind, selectedRoomId, selectedSiteId]);

  useEffect(() => {
    if (!scopeId) {
      setModel(null);
      return;
    }
    const load = async () => {
      setLoading(true);
      setModel(await MockDataService.getLayoutViewModel(scopeId));
      setLoading(false);
    };
    load();
  }, [scopeId]);

  if (!scopeId) {
    return <RouteFallbackState title="Layout View needs a site or room" description="Select a site or room from hierarchy or globe to render topology lanes." />;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }

  if (!model || !model.rooms.length) {
    return <RouteFallbackState title="No layout data" description="This scope has no room/row/rack topology in mock data." />;
  }

  return (
    <section className="space-y-3">
      <header className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="h-4 w-4" /> {model.siteName} Layout • {model.regionName}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Top-down operational topology for rooms, rows, and racks. Click to inspect, double-click to open rack view.</p>
      </header>
      <div className="space-y-3">
        {model.rooms.map((room) => (
          <RoomLayoutPanel
            key={room.roomId}
            room={room}
            selectedRackId={selectedRackId}
            onSelectRoom={(roomId) => onSelectEntity(roomId)}
            onSelectRow={(rowId) => onSelectEntity(rowId)}
            onSelectRack={(rackId) => onSelectEntity(rackId)}
            onOpenRack={onOpenRack}
          />
        ))}
      </div>
    </section>
  );
}
