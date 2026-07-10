import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LeadForm } from "../../LeadForm";
import { updateLead } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const action = updateLead.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Edit ${lead.name}`}
        back={{ href: `/leads/${id}`, label: lead.name }}
      />
      <LeadForm action={action} lead={lead} cancelHref={`/leads/${id}`} />
    </div>
  );
}
