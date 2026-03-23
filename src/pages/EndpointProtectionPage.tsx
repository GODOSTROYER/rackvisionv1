import SectionTemplate from "@/pages/SectionTemplate";
import { alertRows } from "@/data/mockData";

export default function EndpointProtectionPage() {
  return (
    <SectionTemplate
      title="Endpoint Protection"
      subtitle="Threat summary, policy UI, quarantine queue, incident details, and timeline placeholders."
      filters={["Critical", "Quarantined", "Policies", "Incidents"]}
      actions={["Isolate Device", "Quarantine", "Mark Resolved"]}
      highlights={["Threat Timeline", "Policy Controls", "Incident Panel"]}
      columns={[
        { key: "id", label: "Threat ID" },
        { key: "severity", label: "Severity" },
        { key: "device", label: "Endpoint" },
        { key: "message", label: "Detection" },
      ]}
      rows={alertRows}
      statusKey="severity"
    />
  );
}
