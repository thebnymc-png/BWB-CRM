import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { projectTotals } from "@/lib/finance";
import { money, duration } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const db = await getDb();
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      timeEntries: { select: { minutes: true, billable: true } },
      expenses: { select: { amount: true, billable: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
        action={
          <Link href="/projects/new" className="btn-primary">
            + New project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)]">
            No projects yet. Create one against a client to start tracking time
            and money.
          </p>
          <Link href="/projects/new" className="btn-primary mt-4">
            + New project
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="card min-w-[640px] divide-y divide-[var(--border)]">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              <div className="col-span-5">Project</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Tracked</div>
              <div className="col-span-3 text-right">Revenue</div>
            </div>
            {projects.map((p) => {
              const t = projectTotals(p);
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="grid grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-[var(--background)]"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-sm text-[var(--muted)]">
                      {p.client.name}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="col-span-2 text-right text-sm">
                    {duration(t.totalMinutes)}
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    {money(t.revenue)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
