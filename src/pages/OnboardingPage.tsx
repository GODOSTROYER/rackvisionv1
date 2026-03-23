import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function OnboardingPage() {
  return (
    <SectionTemplate
      title="Onboarding"
      subtitle="Setup checklist flow for devices, agents, alerts, integrations, automation, and finish tour."
      filters={["Checklist", "Agents", "Alerts", "Integrations", "Automation"]}
      actions={["Start Step", "Skip", "Complete"]}
      highlights={["Progress Tracker", "Setup Checklist", "Guided Tour"]}
      columns={[
        { key: "name", label: "Step" },
        { key: "group", label: "Area" },
        { key: "status", label: "Progress" },
        { key: "site", label: "Owner" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
