import { useEffect, useState } from "react";
import { ActionButtonGroup } from "@/components/enterprise/ActionButtonGroup";
import { ActivityFeedItem } from "@/components/enterprise/ActivityFeedItem";
import { HealthDonutChart, IncidentBarChart, UptimeLineChart } from "@/components/enterprise/ChartPanel";
import { DateRangePickerStub } from "@/components/enterprise/DateRangePickerStub";
import { EnterpriseDataTable } from "@/components/enterprise/EnterpriseDataTable";
import { FilterBar } from "@/components/enterprise/FilterBar";
import { KPIStatCard } from "@/components/enterprise/KPIStatCard";
import { LoadingCard } from "@/components/enterprise/LoadingCard";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { WidgetCard } from "@/components/enterprise/WidgetCard";
import { getDashboardSummary } from "@/services/api";

type Summary = Awaited<ReturnType<typeof getDashboardSummary>>;

export default function DashboardViewPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setData);
  }, []);

  return (
    <section className="space-y-4">
      <PageHeader
        title="Lab Environment"
        subtitle="Real-time monitoring surface with mock enterprise telemetry"
        actions={<DateRangePickerStub />}
      />

      <FilterBar filters={["All Sites", "Critical", "Windows", "Servers", "Auto Refresh"]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data ? data.kpis.map((kpi) => <KPIStatCard key={kpi.label} {...kpi} />) : Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)}
      </div>

      {data && (
        <div className="grid gap-4 xl:grid-cols-3">
          <WidgetCard title="System Uptime">
            <UptimeLineChart data={data.uptimeTrend} />
          </WidgetCard>
          <WidgetCard title="Automation Activity">
            <IncidentBarChart data={data.uptimeTrend} />
          </WidgetCard>
          <WidgetCard title="Endpoint Health Summary">
            <HealthDonutChart data={data.statusSplit} />
          </WidgetCard>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WidgetCard title="Last Alerts" action={<ActionButtonGroup actions={["Export", "Acknowledge"]} />}>
            <EnterpriseDataTable
              columns={[
                { key: "id", label: "Alert ID" },
                { key: "severity", label: "Severity" },
                { key: "device", label: "Device" },
                { key: "site", label: "Site" },
                { key: "message", label: "Message" },
                { key: "age", label: "Age" },
              ]}
              rows={data?.alerts ?? []}
              statusKey="severity"
            />
          </WidgetCard>
        </div>
        <WidgetCard title="Recent System Events">
          <div className="space-y-2">
            {data?.activity.map((item) => <ActivityFeedItem key={item.title} {...item} />)}
          </div>
        </WidgetCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          "Patch Status",
          "Device Status Overview",
          "Recent Tasks",
          "Top Critical Devices",
          "Patch Compliance Summary",
          "Network Summary",
          "Active Alerts",
          "Quick Actions",
        ].map((name) => (
          <WidgetCard key={name} title={name}>
            <p className="text-sm text-muted-foreground">Polished enterprise widget placeholder with realistic static metrics.</p>
          </WidgetCard>
        ))}
      </div>
    </section>
  );
}
