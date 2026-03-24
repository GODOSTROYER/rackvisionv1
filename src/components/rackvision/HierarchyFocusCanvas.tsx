import { ChevronRight, Network } from "lucide-react";
import { EntityIcon } from "@/components/rackvision/EntityIcon";
import { StatusDot } from "@/components/rackvision/StatusDot";
import { HierarchyNode, RackVisionEntityKind } from "@/components/rackvision/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type HierarchyFocusCanvasProps = {
  nodes: HierarchyNode[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenDevice: (id: string) => Promise<void>;
};

function findHierarchyNode(nodes: HierarchyNode[], targetId: string | null): HierarchyNode | null {
  if (!targetId) {
    return null;
  }

  for (const node of nodes) {
    if (node.entity.id === targetId) {
      return node;
    }

    const childMatch = findHierarchyNode(node.children, targetId);

    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

function getHierarchyMeta(node: HierarchyNode): string {
  if (node.entity.kind === "device") {
    return `${node.entity.deviceType} • ${node.entity.ipAddress}`;
  }

  if (node.entity.kind === "rack") {
    return `Occupancy ${node.entity.occupancyPercent}% • ${node.children.length} device${node.children.length === 1 ? "" : "s"}`;
  }

  return `${node.children.length} child ${node.children.length === 1 ? "node" : "nodes"}`;
}

function getHierarchyDescription(kind: RackVisionEntityKind | "global"): string {
  if (kind === "global") {
    return "Showing the full infrastructure tree. Select any node from the left pane to focus this canvas.";
  }

  if (kind === "region") {
    return "Showing all sites and infrastructure nested under this region.";
  }

  if (kind === "site") {
    return "Showing rooms, rows, racks, and devices nested under this site.";
  }

  if (kind === "room") {
    return "Showing rows, racks, and devices nested under this room.";
  }

  if (kind === "row") {
    return "Showing racks and devices nested under this row.";
  }

  if (kind === "rack") {
    return "Showing all devices currently placed in this rack.";
  }

  return "Showing the selected device in its hierarchy context.";
}

type HierarchyBranchProps = {
  node: HierarchyNode;
  depth: number;
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => Promise<void>;
  onOpenDevice: (id: string) => Promise<void>;
};

function HierarchyBranch({
  node,
  depth,
  selectedEntityId,
  onSelectEntity,
  onOpenDevice,
}: HierarchyBranchProps) {
  const isSelected = selectedEntityId === node.entity.id;
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        {depth > 0 ? <div className="absolute -left-4 top-0 h-full border-l border-border/70" /> : null}
        <article
          className={cn(
            "relative rounded-lg border bg-card p-3 shadow-sm transition-colors",
            isSelected ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2 text-left"
              onClick={() => onSelectEntity(node.entity.id)}
            >
              <StatusDot status={node.entity.healthStatus} className="mt-1 h-2.5 w-2.5" />
              <EntityIcon kind={node.entity.kind} className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-foreground">{node.entity.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {node.entity.kind.charAt(0).toUpperCase()}
                  {node.entity.kind.slice(1)} • {getHierarchyMeta(node)}
                </p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              {node.entity.kind === "device" ? (
                <Button size="sm" variant="outline" onClick={() => onOpenDevice(node.entity.id)}>
                  Open System
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onSelectEntity(node.entity.id)}>
                  Focus
                </Button>
              )}
            </div>
          </div>
        </article>
      </div>

      {hasChildren ? (
        <div className="ml-4 space-y-2 border-l border-dashed border-border/70 pl-4">
          {node.children.map((child) => (
            <HierarchyBranch
              key={child.entity.id}
              node={child}
              depth={depth + 1}
              selectedEntityId={selectedEntityId}
              onSelectEntity={onSelectEntity}
              onOpenDevice={onOpenDevice}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HierarchyFocusCanvas({
  nodes,
  selectedEntityId,
  onSelectEntity,
  onOpenDevice,
}: HierarchyFocusCanvasProps) {
  const focusedNode = findHierarchyNode(nodes, selectedEntityId);
  const rootNodes = focusedNode ? [focusedNode] : nodes;
  const rootKind = focusedNode?.entity.kind ?? "global";
  const rootName = focusedNode?.entity.name ?? "Global Infrastructure";

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Network className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Hierarchy Focus</h2>
            <p className="mt-1 text-xs text-muted-foreground">{getHierarchyDescription(rootKind)}</p>
          </div>
        </div>
        <div className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{rootName}</span>
          <span className="mx-1">•</span>
          <span>{focusedNode ? `${focusedNode.children.length} direct children` : `${nodes.length} top-level branches`}</span>
        </div>
      </div>

      <ScrollArea className="h-[640px] pr-3" aria-label="Expanded hierarchy focus canvas">
        <div className="space-y-3 pb-4">
          {rootNodes.map((node) => (
            <div key={node.entity.id} className="space-y-2">
              {focusedNode ? null : (
                <div className="flex items-center gap-2 pl-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {node.entity.name}
                </div>
              )}
              <HierarchyBranch
                node={node}
                depth={0}
                selectedEntityId={selectedEntityId}
                onSelectEntity={onSelectEntity}
                onOpenDevice={onOpenDevice}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}
