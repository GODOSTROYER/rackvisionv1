import SectionTemplate from "@/pages/SectionTemplate";
import { workflowRows } from "@/data/mockData";

export default function AutomationPage() {
  return (
    <SectionTemplate
      title="Automation"
      subtitle="Workflow list, visual builder placeholders, template gallery, history, and script library."
      filters={["Active", "Draft", "Templates", "Execution History"]}
      actions={["Run Workflow", "Clone", "Publish"]}
      highlights={["Trigger/Condition/Action Builder", "Template Gallery", "Managed Files"]}
      columns={[
        { key: "id", label: "Workflow ID" },
        { key: "name", label: "Name" },
        { key: "trigger", label: "Trigger" },
        { key: "status", label: "Status" },
        { key: "runs", label: "Runs" },
      ]}
      rows={workflowRows}
      statusKey="status"
    />
  );
}
