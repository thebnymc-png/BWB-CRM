import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDate } from "@/lib/format";
import { deleteLead, convertLeadToClient } from "../actions";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const convert = convertLeadToClient.bind(null, id);

  return (
    <div>
      <PageHeader
        title={lead.name}
        subtitle={lead.company ?? undefined}
        back={{ href: "/leads", label: "Leads" }}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/leads/${id}/edit`} className="btn-ghost btn-sm">
              Edit
            </Link>
            <DeleteButton
              action={deleteLead.bind(null, id)}
              confirm={`Delete lead “${lead.name}”?`}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            {lead.source && (
              <span className="badge bg-gray-100 text-gray-600">
                {lead.source}
              </span>
            )}
            {lead.nextFollowUp && (
              <span className="text-sm text-[var(--muted)]">
                Follow up {formatDate(lead.nextFollowUp)}
              </span>
            )}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={lead.email} />
            <Field label="Phone" value={lead.phone} />
            <div className="sm:col-span-2">
              <Field label="Notes" value={lead.notes} />
            </div>
          </dl>
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-sm font-semibold">Convert</h2>
          {lead.convertedClientId ? (
            <div className="mt-3 text-sm">
              <p className="text-[var(--muted)]">
                This lead has been converted to a client.
              </p>
              <Link
                href={`/clients/${lead.convertedClientId}`}
                className="btn-ghost btn-sm mt-3"
              >
                View client →
              </Link>
            </div>
          ) : (
            <form action={convert} className="mt-3">
              <p className="mb-3 text-sm text-[var(--muted)]">
                Won the work? Create a client record from this lead (name,
                company and contact details carry over) and mark it as won.
              </p>
              <SubmitButton>Convert to client</SubmitButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
