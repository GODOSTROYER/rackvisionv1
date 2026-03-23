import SectionTemplate from "@/pages/SectionTemplate";
import { uptimeTrend } from "@/data/mockData";

export default function AdvancedReportingPage() {
  return (
    <SectionTemplate
      title="Advanced Reporting"
      subtitle="Custom report builder UI with analytics filters, chart config panel, and saved views."
      filters={["Date Range", "Sites", "Groups", "Metrics"]}
      actions={["Save View", "Render", "Export Dataset"]}
      highlights={["Custom Builder", "Chart Config", "Saved Report Views"]}
      columns={[
        { key: "name", label: "Period" },
        { key: "uptime", label: "Uptime" },
        { key: "incidents", label: "Incidents" },
      ]}
      rows={uptimeTrend.map((x, i) => ({ id: `ADV-${i}`, name: x.name, uptime: `${x.uptime}%`, incidents: `${x.incidents}` }))}
    />
  );
}
