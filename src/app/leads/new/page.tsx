import { PageHeader } from "@/components/PageHeader";
import { LeadForm } from "../LeadForm";
import { createLead } from "../actions";

export default function NewLeadPage() {
  return (
    <div>
      <PageHeader title="New lead" back={{ href: "/leads", label: "Leads" }} />
      <LeadForm action={createLead} cancelHref="/leads" />
    </div>
  );
}
