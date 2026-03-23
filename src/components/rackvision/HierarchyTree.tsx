import { HierarchyTreeNode } from "@/components/rackvision/HierarchyTreeNode";
import { HierarchyNode } from "@/components/rackvision/types";

type HierarchyTreeProps = {
  nodes: HierarchyNode[];
  selectedEntityId: string | null;
  expandedIds: string[];
  matchedIds: string[];
  onToggleExpanded: (id: string) => void;
  onSelectNode: (node: HierarchyNode) => void;
  onOpenNode: (node: HierarchyNode) => void;
};

export function HierarchyTree({
  nodes,
  selectedEntityId,
  expandedIds,
  matchedIds,
  onToggleExpanded,
  onSelectNode,
  onOpenNode,
}: HierarchyTreeProps) {
  const hasMatchInSubtree = (node: HierarchyNode): boolean => {
    if (!matchedIds.length) return true;
    if (matchedIds.includes(node.entity.id)) return true;
    return node.children.some(hasMatchInSubtree);
  };

  return (
    <div className="space-y-1 pb-3">
      {nodes.map((node) => (
        <HierarchyTreeNode
          key={node.entity.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          matchedIds={matchedIds}
          selectedEntityId={selectedEntityId}
          onToggleExpanded={onToggleExpanded}
          onSelectNode={onSelectNode}
          onOpenNode={onOpenNode}
          isVisible={hasMatchInSubtree}
        />
      ))}
    </div>
  );
}
