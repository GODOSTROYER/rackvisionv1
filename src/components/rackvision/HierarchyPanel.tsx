import { FolderSearch } from "lucide-react";
import { HierarchySearchInput } from "@/components/rackvision/HierarchySearchInput";
import { HierarchyTree } from "@/components/rackvision/HierarchyTree";
import { useRackVision } from "@/components/rackvision/RackVisionContext";
import { HierarchyNode } from "@/components/rackvision/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type HierarchyPanelProps = {
  nodes: HierarchyNode[];
  onSearch: (query: string) => void;
  onSelectEntity: (id: string) => void;
  onOpenDevice: (id: string) => void;
};

export function HierarchyPanel({ nodes, onSearch, onSelectEntity, onOpenDevice }: HierarchyPanelProps) {
  const { state, dispatch } = useRackVision();

  return (
    <aside className="min-h-0 rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Hierarchy</h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <FolderSearch className="h-3.5 w-3.5" /> Live tree
        </span>
      </div>

      <HierarchySearchInput
        value={state.searchQuery}
        onChange={(query) => {
          dispatch({ type: "SET_TREE_SEARCH", payload: query });
          onSearch(query);
        }}
      />
      <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
        Arrow keys move between entities, <code className="rounded bg-muted px-1 py-0.5">Enter</code> selects, and <code className="rounded bg-muted px-1 py-0.5">Ctrl+Enter</code> opens devices.
      </p>

      <ScrollArea className="h-[320px] pr-2 sm:h-[420px] xl:h-[520px]" aria-label="RackVision hierarchy tree">
        <HierarchyTree
          nodes={nodes}
          selectedEntityId={state.selectedEntityId}
          expandedIds={state.expandedNodeIds}
          matchedIds={state.treeResults}
          onToggleExpanded={(id) => dispatch({ type: "TOGGLE_NODE_EXPANDED", payload: id })}
          onSelectNode={(node) => onSelectEntity(node.entity.id)}
          onOpenNode={(node) => {
            if (node.entity.kind === "device") onOpenDevice(node.entity.id);
          }}
        />
      </ScrollArea>
    </aside>
  );
}
