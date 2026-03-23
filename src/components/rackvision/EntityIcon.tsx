import { Building2, FolderTree, Network, Rows3, Server, ServerCog } from "lucide-react";
import { RackVisionEntityKind } from "@/components/rackvision/types";

const iconMap: Record<RackVisionEntityKind, React.ComponentType<{ className?: string }>> = {
  global: Network,
  region: Network,
  site: Building2,
  room: FolderTree,
  row: Rows3,
  rack: ServerCog,
  device: Server,
};

export function EntityIcon({ kind, className }: { kind: RackVisionEntityKind; className?: string }) {
  const Icon = iconMap[kind];
  return <Icon className={className} />;
}
