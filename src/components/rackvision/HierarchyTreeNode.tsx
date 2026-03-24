import { ChevronRight } from "lucide-react";
import { EntityIcon } from "@/components/rackvision/EntityIcon";
import { StatusDot } from "@/components/rackvision/StatusDot";
import { HierarchyNode } from "@/components/rackvision/types";
import { cn } from "@/lib/utils";

type HierarchyTreeNodeProps = {
  node: HierarchyNode;
  depth: number;
  isSelected: boolean;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  isMatched: boolean;
  onToggleExpanded: (id: string) => void;
  onSelectNode: (node: HierarchyNode) => void;
  onOpenNode: (node: HierarchyNode) => void;
  buttonRef?: (element: HTMLButtonElement | null) => void;
  onFocusNode: (id: string) => void;
};

export function HierarchyTreeNode({
  node,
  depth,
  isSelected,
  isActive,
  hasChildren,
  isExpanded,
  isMatched,
  onToggleExpanded,
  onSelectNode,
  onOpenNode,
  buttonRef,
  onFocusNode,
}: HierarchyTreeNodeProps) {
  const secondaryMeta =
    node.entity.kind === "device"
      ? `${node.entity.deviceType} • ${node.entity.ipAddress}`
      : node.entity.kind === "rack"
        ? `Occupancy ${node.entity.occupancyPercent}%`
        : `${node.children.length} child ${node.children.length === 1 ? "node" : "nodes"}`;

  return (
    <div className="space-y-0.5">
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpanded(node.entity.id)}
          className={cn(
            "mt-0.5 grid h-5 w-5 place-items-center rounded-sm text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            !hasChildren && "pointer-events-none opacity-40",
          )}
          aria-label={hasChildren ? `${isExpanded ? "Collapse" : "Expand"} ${node.entity.name}` : `${node.entity.name} has no child nodes`}
          aria-hidden={hasChildren ? undefined : true}
          tabIndex={-1}
        >
          {hasChildren ? <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-90")} /> : null}
        </button>
        <button
          ref={buttonRef}
          type="button"
          role="treeitem"
          aria-level={depth + 1}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          tabIndex={isActive ? 0 : -1}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-1.5 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            isSelected ? "border-primary bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/40",
            isActive && "ring-1 ring-ring",
          )}
          style={{ paddingLeft: `${depth * 8}px` }}
          onFocus={() => onFocusNode(node.entity.id)}
          onClick={() => {
            onFocusNode(node.entity.id);
            onSelectNode(node);
          }}
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
    </div>
  );
}
