import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function ConfigurationPage() {
  return (
    <SectionTemplate
      title="Configuration"
      subtitle="Grouped settings for General, Branding, Notifications, Alert Rules, and defaults (UI-only save)."
      filters={["General", "Branding", "Notifications", "Alert Rules", "Integrations"]}
      actions={["Save Settings", "Discard", "Preview"]}
      highlights={["Remote Access", "Patch Defaults", "Automation Defaults"]}
      columns={[
        { key: "name", label: "Section" },
        { key: "group", label: "Category" },
        { key: "status", label: "State" },
        { key: "site", label: "Scope" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
