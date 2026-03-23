import SectionTemplate from "@/pages/SectionTemplate";
import { alertRows } from "@/data/mockData";

export default function ReportingPage() {
  return (
    <SectionTemplate
      title="Reporting"
      subtitle="Report templates, scheduling modal placeholders, previews, and export controls."
      filters={["Templates", "Scheduled", "Recent Exports"]}
      actions={["Schedule Report", "Export", "Duplicate"]}
      highlights={["Report Templates", "Preview Cards", "Schedule Modal"]}
      columns={[
        { key: "id", label: "Report" },
        { key: "severity", label: "Type" },
        { key: "device", label: "Data Source" },
        { key: "message", label: "Summary" },
      ]}
      rows={alertRows}
      statusKey="severity"
    />
  );
}
