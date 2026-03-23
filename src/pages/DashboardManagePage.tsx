import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function DashboardManagePage() {
  return (
    <SectionTemplate
      title="Dashboard - Manage"
      subtitle="Customize, reorder, and save dashboard layouts (visual-only controls)."
      filters={["Default Layout", "NOC", "MSP", "Exec", "Widget Density"]}
      actions={["Save Layout", "Reset", "Publish"]}
      highlights={["Widget Library", "Saved Layouts", "Grid Reorder Surface"]}
      columns={[
        { key: "name", label: "Widget" },
        { key: "group", label: "Category" },
        { key: "status", label: "Visibility" },
        { key: "site", label: "Scope" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
