import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteClient } from "../actions";
import { money } from "@/lib/format";

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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const client = await db.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { timeEntries: true } },
        },
      },
    },
  });
  if (!client) notFound();

  const del = deleteClient.bind(null, id);

  return (
    <div>
      <PageHeader
        title={client.name}
        subtitle={client.company ?? undefined}
        back={{ href: "/clients", label: "Clients" }}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/clients/${id}/edit`} className="btn-ghost btn-sm">
              Edit
            </Link>
            <DeleteButton
              action={del}
              confirm={`Delete ${client.name} and all their projects? This cannot be undone.`}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <StatusBadge status={client.status} />
          </div>
          <dl className="space-y-4">
            <Field label="Email" value={client.email} />
            <Field label="Phone" value={client.phone} />
            <Field label="Website" value={client.website} />
            <Field label="Address" value={client.address} />
            <Field label="Notes" value={client.notes} />
          </dl>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Link
              href={`/projects/new?clientId=${id}`}
              className="btn-primary btn-sm"
            >
              + New project
            </Link>
          </div>

          {client.projects.length === 0 ? (
            <div className="card p-8 text-center text-sm text-[var(--muted)]">
              No projects for this client yet.
            </div>
          ) : (
            <div className="card divide-y divide-[var(--border)]">
              {client.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--background)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      {p.hourlyRate ? `${money(p.hourlyRate)}/hr` : ""}
                      {p.hourlyRate && p.fixedFee ? " · " : ""}
                      {p.fixedFee ? `${money(p.fixedFee)} fixed` : ""}
                      {!p.hourlyRate && !p.fixedFee ? "No rate set" : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-[var(--muted)]">
                    {p._count.timeEntries} entries
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
