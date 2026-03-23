import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function ServerAdminPage() {
  return (
    <SectionTemplate
      title="Server Admin"
      subtitle="Server groups, operational controls dashboard, and role/permission UI placeholders."
      filters={["Groups", "Roles", "Operational Controls"]}
      actions={["Create Group", "Apply Role", "Execute Action"]}
      highlights={["Server Groups", "Permissions Matrix", "Admin Actions"]}
      columns={[
        { key: "name", label: "Server" },
        { key: "group", label: "Group" },
        { key: "status", label: "Health" },
        { key: "site", label: "Location" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
