import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function PatchManagementPage() {
  return (
    <SectionTemplate
      title="Patch Management"
      subtitle="Compliance dashboard, approval queue, patch history, and maintenance windows UI."
      filters={["Missing", "Approved", "Failed", "Maintenance Window"]}
      actions={["Approve", "Decline", "Run Scan"]}
      highlights={["Compliance Summary", "Approval Queue", "Patch History"]}
      columns={[
        { key: "name", label: "Agent" },
        { key: "group", label: "Policy" },
        { key: "status", label: "Status" },
        { key: "site", label: "Window" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
