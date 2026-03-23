import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { SystemDetails } from "@/components/rackvision/types";

export function SystemDetailsHeader({ details }: { details: SystemDetails }) {
  return (
    <header className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{details.hostname}</h1>
          <p className="text-xs text-muted-foreground">{details.deviceType} • {details.ipAddress} • {details.osPlatform}</p>
          <p className="text-xs text-muted-foreground">{details.siteName} • {details.roomName} • {details.rowName} • {details.rackName}</p>
        </div>
        <StatusBadge status={details.healthStatus} />
      </div>
    </header>
  );
}
