import SectionTemplate from "@/pages/SectionTemplate";
import { systemsRows } from "@/data/mockData";

export default function NetworksPage() {
  return (
    <SectionTemplate
      title="Networks"
      subtitle="Network device view with topology mock, SNMP panel, and inspector side panel."
      filters={["SNMP", "Switches", "Firewalls", "Offline", "Sites"]}
      actions={["Scan", "Export", "Acknowledge"]}
      highlights={["Topology/Map", "SNMP Devices", "Inspector Panel"]}
      columns={[
        { key: "name", label: "Device" },
        { key: "site", label: "Site" },
        { key: "group", label: "Zone" },
        { key: "status", label: "Status" },
      ]}
      rows={systemsRows}
      statusKey="status"
    />
  );
}
