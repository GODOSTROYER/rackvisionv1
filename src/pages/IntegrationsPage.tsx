import SectionTemplate from "@/pages/SectionTemplate";
import { integrations } from "@/data/mockData";

export default function IntegrationsPage() {
  return (
    <SectionTemplate
      title="Integrations"
      subtitle="Marketplace cards for PSA, support, alerting, and security integrations (mock states only)."
      filters={["All", "Connected", "Disconnected", "Security"]}
      actions={["Configure", "Reconnect", "Disable"]}
      highlights={["Marketplace Grid", "Config Drawer", "Connection Health"]}
      columns={[
        { key: "name", label: "Integration" },
        { key: "status", label: "Status" },
      ]}
      rows={integrations.map((x, i) => ({ id: `INT-${i}`, ...x }))}
      statusKey="status"
    />
  );
}
