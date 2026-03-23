import SectionTemplate from "@/pages/SectionTemplate";
import { alertRows } from "@/data/mockData";

export default function ClientPortalPage() {
  return (
    <SectionTemplate
      title="Client Portal"
      subtitle="End-user support portal with tickets, requests, knowledge base, and chat placeholder."
      filters={["Open Tickets", "My Queue", "SLA Risk", "Knowledge Base"]}
      actions={["New Ticket", "Assign", "Send Update"]}
      highlights={["Support Requests", "Live Chat Placeholder", "Device Summary"]}
      columns={[
        { key: "id", label: "Ticket" },
        { key: "severity", label: "Priority" },
        { key: "device", label: "Requester Device" },
        { key: "message", label: "Issue" },
        { key: "age", label: "Age" },
      ]}
      rows={alertRows}
      statusKey="severity"
    />
  );
}
