import { ChevronRight } from "lucide-react";
import { EntityIcon } from "@/components/rackvision/EntityIcon";
import { StatusDot } from "@/components/rackvision/StatusDot";
import { HierarchyNode } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type HierarchyTreeNodeProps = {
  node: HierarchyNode;
  depth: number;
  expandedIds: string[];
  matchedIds: string[];
  selectedEntityId: string | null;
  onToggleExpanded: (id: string) => void;
  onSelectNode: (node: HierarchyNode) => void;
  onOpenNode: (node: HierarchyNode) => void;
  isVisible: (node: HierarchyNode) => boolean;
};

export function HierarchyTreeNode({
  node,
  depth,
  expandedIds,
  matchedIds,
  selectedEntityId,
  onToggleExpanded,
  onSelectNode,
  onOpenNode,
  isVisible,
}: HierarchyTreeNodeProps) {
  if (!isVisible(node)) return null;

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.includes(node.entity.id);
  const isSelected = selectedEntityId === node.entity.id;
  const isMatched = matchedIds.includes(node.entity.id);

  const secondaryMeta =
    node.entity.kind === "device"
      ? `${node.entity.deviceType} • ${node.entity.ipAddress}`
      : node.entity.kind === "rack"
        ? `Occupancy ${node.entity.occupancyPercent}%`
        : `${node.children.length} child ${node.children.length === 1 ? "node" : "nodes"}`;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md border px-1.5 py-1.5 transition-colors",
          isSelected ? "border-primary bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/40",
        )}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpanded(node.entity.id)}
          className="grid h-5 w-5 place-items-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          aria-label={hasChildren ? `${isExpanded ? "Collapse" : "Expand"} ${node.entity.name}` : `${node.entity.name} has no child nodes`}
          aria-hidden={hasChildren ? undefined : true}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} /> : null}
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          style={{ paddingLeft: `${depth * 8}px` }}
          onClick={() => onSelectNode(node)}
          onDoubleClick={() => onOpenNode(node)}
          aria-label={`${node.entity.name}, ${node.entity.kind}`}
        >
          <StatusDot status={node.entity.healthStatus} />
          <EntityIcon kind={node.entity.kind} className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate text-xs font-medium text-foreground">{node.entity.name}</span>
          {isMatched ? <span className="rounded bg-accent px-1 py-0.5 text-[10px] text-accent-foreground">Match</span> : null}
        </button>
      </div>
      <p className="truncate pl-9 text-[11px] text-muted-foreground">{secondaryMeta}</p>
      {hasChildren && isExpanded ? (
        <div className="mt-1 space-y-0.5 border-l border-border/70 pl-2" role="group">{node.children.map((child) => (
          <HierarchyTreeNode
            key={child.entity.id}
            node={child}
            depth={depth + 1}
            expandedIds={expandedIds}
            matchedIds={matchedIds}
            selectedEntityId={selectedEntityId}
            onToggleExpanded={onToggleExpanded}
            onSelectNode={onSelectNode}
            onOpenNode={onOpenNode}
            isVisible={isVisible}
          />
        ))}</div>
      ) : null}
    </div>
  );
}
