import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
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

type VisibleTreeNode = {
  node: HierarchyNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
  isExpanded: boolean;
};

function hasMatchInSubtree(node: HierarchyNode, matchedIds: string[]): boolean {
  if (!matchedIds.length) return true;
  if (matchedIds.includes(node.entity.id)) return true;
  return node.children.some((child) => hasMatchInSubtree(child, matchedIds));
}

function collectVisibleNodes(
  nodes: HierarchyNode[],
  depth: number,
  parentId: string | null,
  expandedIds: string[],
  matchedIds: string[],
  visible: VisibleTreeNode[],
) {
  nodes.forEach((node) => {
    if (!hasMatchInSubtree(node, matchedIds)) return;

    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.includes(node.entity.id);
    visible.push({
      node,
      depth,
      parentId,
      hasChildren,
      isExpanded,
    });

    if (hasChildren && isExpanded) {
      collectVisibleNodes(node.children, depth + 1, node.entity.id, expandedIds, matchedIds, visible);
    }
  });
}

export function HierarchyTree({
  nodes,
  selectedEntityId,
  expandedIds,
  matchedIds,
  onToggleExpanded,
  onSelectNode,
  onOpenNode,
}: HierarchyTreeProps) {
  const visibleNodes = useMemo(() => {
    const visible: VisibleTreeNode[] = [];
    collectVisibleNodes(nodes, 0, null, expandedIds, matchedIds, visible);
    return visible;
  }, [expandedIds, matchedIds, nodes]);

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeNodeId, setActiveNodeId] = useState<string | null>(selectedEntityId);

  useEffect(() => {
    if (!visibleNodes.length) {
      setActiveNodeId(null);
      return;
    }

    if (activeNodeId && visibleNodes.some((item) => item.node.entity.id === activeNodeId)) {
      return;
    }

    const nextActive = selectedEntityId && visibleNodes.some((item) => item.node.entity.id === selectedEntityId)
      ? selectedEntityId
      : visibleNodes[0]?.node.entity.id ?? null;
    setActiveNodeId(nextActive);
  }, [activeNodeId, selectedEntityId, visibleNodes]);

  useEffect(() => {
    if (!activeNodeId) return;
    const button = buttonRefs.current[activeNodeId];
    if (button && document.activeElement !== button) {
      button.focus();
    }
  }, [activeNodeId]);

  const focusNode = (nodeId: string) => {
    setActiveNodeId(nodeId);
    buttonRefs.current[nodeId]?.focus();
  };

  const moveToIndex = (index: number) => {
    const next = visibleNodes[index];
    if (!next) return;
    focusNode(next.node.entity.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!visibleNodes.length) return;
    const currentId = activeNodeId ?? selectedEntityId ?? visibleNodes[0]?.node.entity.id ?? null;
    const currentIndex = currentId ? visibleNodes.findIndex((item) => item.node.entity.id === currentId) : -1;
    if (currentIndex < 0) return;

    const current = visibleNodes[currentIndex];

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveToIndex(Math.min(currentIndex + 1, visibleNodes.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveToIndex(Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveToIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveToIndex(visibleNodes.length - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (current.hasChildren && !current.isExpanded) {
        onToggleExpanded(current.node.entity.id);
        return;
      }
      moveToIndex(Math.min(currentIndex + 1, visibleNodes.length - 1));
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (current.hasChildren && current.isExpanded) {
        onToggleExpanded(current.node.entity.id);
        return;
      }

      if (current.parentId) {
        const parentIndex = visibleNodes.findIndex((item) => item.node.entity.id === current.parentId);
        if (parentIndex >= 0) moveToIndex(parentIndex);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectNode(current.node);
      if ((event.ctrlKey || event.metaKey) && current.node.entity.kind === "device") {
        onOpenNode(current.node);
      }
      if (event.key === "Enter" && current.node.entity.kind === "device" && current.node.entity.id === selectedEntityId) {
        onOpenNode(current.node);
      }
    }
  };

  return (
    <div className="space-y-1 pb-3" role="tree" aria-label="Infrastructure hierarchy" onKeyDown={handleKeyDown}>
      {visibleNodes.map(({ node, depth, hasChildren, isExpanded }) => {
        const isSelected = selectedEntityId === node.entity.id;
        const isActive = activeNodeId === node.entity.id;
        return (
          <HierarchyTreeNode
            key={node.entity.id}
            node={node}
            depth={depth}
            isSelected={isSelected}
            isActive={isActive}
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            isMatched={matchedIds.includes(node.entity.id)}
            onToggleExpanded={onToggleExpanded}
            onSelectNode={onSelectNode}
            onOpenNode={onOpenNode}
            onFocusNode={focusNode}
            buttonRef={(element) => {
              buttonRefs.current[node.entity.id] = element;
            }}
          />
        );
      })}
    </div>
  );
}
