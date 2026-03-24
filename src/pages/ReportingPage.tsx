import { useMemo, useState } from "react";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OperationsMockService } from "@/services/ops/OperationsMockService";

export default function ReportingPage() {
  const [role, setRole] = useState<"NOC" | "Infra Admin" | "Ops Manager">("Ops Manager");
  const [reportWindow, setReportWindow] = useState<"24h" | "7d">("7d");

  const summaryCards = useMemo(
    () => [
      { title: "Executive Summary", value: reportWindow === "24h" ? "Stable with 2 critical incidents" : "Improving risk posture week-over-week" },
      { title: "Top Risky Sites", value: "Virginia-DC3, Mumbai-DC1" },
      { title: "Most Alerting Racks", value: "NET-RACK-03, RACK-A-01" },
      { title: "Capacity Forecast", value: "+6% rack occupancy in 30 days" },
      { title: "Health Distribution", value: "Healthy 82% · Warning 13% · Critical 5%" },
    ],
    [reportWindow],
  );

  return (
    <section className="space-y-4">
      <PageHeader
        title="Reporting & Role-Based Views"
        subtitle="Executive and operational reporting presets with role-oriented focus areas."
        actions={<Badge variant="outline">{reportWindow} Window</Badge>}
      />

      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["NOC", "Infra Admin", "Ops Manager"] as const).map((preset) => (
            <Button key={preset} size="sm" variant={role === preset ? "default" : "outline"} onClick={() => setRole(preset)}>
              {preset}
            </Button>
          ))}
          <div className="ml-4 flex gap-2">
            {(["24h", "7d"] as const).map((window) => (
              <Button key={window} size="sm" variant={reportWindow === window ? "default" : "outline"} onClick={() => setReportWindow(window)}>
                {window}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Role preset filters: {JSON.stringify(OperationsMockService.getRolePreset(role))}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <WidgetCard key={card.title} title={card.title}>
            <p className="text-sm">{card.value}</p>
          </WidgetCard>
        ))}
      </div>
    </section>
  );
}
