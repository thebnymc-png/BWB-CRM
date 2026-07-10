import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const db = await getDb();
  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} ${clients.length === 1 ? "client" : "clients"}`}
        action={
          <Link href="/clients/new" className="btn-primary">
            + New client
          </Link>
        }
      />

      {clients.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)]">
            No clients yet. Add your first one to start tracking projects and
            time.
          </p>
          <Link href="/clients/new" className="btn-primary mt-4">
            + New client
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border)]">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--background)]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="truncate text-sm text-[var(--muted)]">
                  {[c.company, c.email].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className="shrink-0 text-sm text-[var(--muted)]">
                {c._count.projects}{" "}
                {c._count.projects === 1 ? "project" : "projects"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
