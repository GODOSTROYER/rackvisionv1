import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function AccountPage() {
  return (
    <SectionTemplate
      title="Account"
      subtitle="Organization profile, billing summary, usage stats, members, and role management UI."
      filters={["Organization", "Billing", "Members", "Roles"]}
      actions={["Invite Member", "Update Plan", "Save"]}
      highlights={["Subscription Cards", "Usage Stats", "Team Management"]}
      columns={[
        { key: "name", label: "Member/System" },
        { key: "group", label: "Role" },
        { key: "status", label: "Status" },
        { key: "site", label: "Team/Site" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
