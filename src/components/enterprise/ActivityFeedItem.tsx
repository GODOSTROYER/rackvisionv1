import { StatusBadge } from "@/components/enterprise/StatusBadge";

export function ActivityFeedItem({ title, time, tag }: { title: string; time: string; tag: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/70 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <StatusBadge status={tag} />
    </div>
  );
}
