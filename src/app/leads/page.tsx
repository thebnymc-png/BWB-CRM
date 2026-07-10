import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { LeadBoard } from "./LeadBoard";
import { updateLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const db = await getDb();
  const leads = await db.lead.findMany({
    orderBy: [{ nextFollowUp: "asc" }, { createdAt: "desc" }],
  });

  const open = leads.filter(
    (l) => l.status !== "won" && l.status !== "lost",
  ).length;

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${open} open · drag cards to move them through your pipeline`}
        action={
          <Link href="/leads/new" className="btn-primary">
            + New lead
          </Link>
        }
      />

      {leads.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)]">
            No leads yet. Add a cold call or prospect to start your pipeline.
          </p>
          <Link href="/leads/new" className="btn-primary mt-4">
            + New lead
          </Link>
        </div>
      ) : (
        <LeadBoard
          leads={leads.map((l) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            source: l.source,
            status: l.status,
            notes: l.notes,
            nextFollowUp: l.nextFollowUp
              ? l.nextFollowUp.toISOString()
              : null,
            convertedClientId: l.convertedClientId,
          }))}
          updateLeadStatus={updateLeadStatus}
        />
      )}
    </div>
  );
}
