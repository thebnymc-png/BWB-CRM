import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RunningTimerBanner } from "@/components/RunningTimerBanner";
import { projectTotals } from "@/lib/finance";
import { money, duration } from "@/lib/format";
import { stopTimer } from "./time/actions";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="card h-full p-5 transition-colors hover:bg-[var(--background)]">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function Dashboard() {
  const db = await getDb();
  const [projects, clientCount, leadCount, running, sentInvoices] =
    await Promise.all([
      db.project.findMany({
        include: {
          client: true,
          timeEntries: {
            select: { minutes: true, billable: true, startTime: true },
          },
          expenses: { select: { amount: true, billable: true } },
        },
      }),
      db.client.count({ where: { status: "active" } }),
      db.lead.count({ where: { status: { notIn: ["won", "lost"] } } }),
      db.timeEntry.findFirst({
        where: { endTime: null },
        include: { project: { include: { client: true } } },
      }),
      db.invoice.findMany({
        where: { status: "sent" },
        select: { amount: true },
      }),
    ]);

  const outstanding = sentInvoices.reduce((s, i) => s + i.amount, 0);

  const activeProjects = projects.filter((p) => p.status === "active");
  let totalRevenue = 0;
  let totalProfit = 0;
  for (const p of projects) {
    const t = projectTotals(p);
    totalRevenue += t.revenue;
    totalProfit += t.profit;
  }

  // Hours this week (last 7 days)
  const weekAgo = new Date(new Date().getTime() - 6 * 86400000);
  let weekMinutes = 0;
  for (const p of projects) {
    for (const e of p.timeEntries) {
      if (e.startTime >= weekAgo) weekMinutes += e.minutes;
    }
  }

  const recentProjects = [...activeProjects].slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your freelance business at a glance"
      />

      {running && (
        <div className="mb-6">
          <RunningTimerBanner
            entry={{
              id: running.id,
              startTime: running.startTime.toISOString(),
              projectName: running.project.name,
              clientName: running.project.client.name,
              description: running.description,
            }}
            stopTimer={stopTimer}
          />
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Revenue booked" value={money(totalRevenue)} />
        <StatCard
          label="Outstanding"
          value={money(outstanding)}
          href="/invoices"
        />
        <StatCard
          label="Tracked this week"
          value={duration(weekMinutes)}
          href="/time"
        />
        <StatCard label="Profit" value={money(totalProfit)} />
        <StatCard
          label="Active projects"
          value={String(activeProjects.length)}
          href="/projects"
        />
        <StatCard
          label="Active clients"
          value={String(clientCount)}
          href="/clients"
        />
        <StatCard label="Open leads" value={String(leadCount)} href="/leads" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active projects</h2>
        <Link
          href="/projects"
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View all →
        </Link>
      </div>

      {recentProjects.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--muted)]">
            Nothing on the go yet. Add a client, then spin up a project to start
            tracking.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/clients/new" className="btn-ghost">
              + New client
            </Link>
            <Link href="/projects/new" className="btn-primary">
              + New project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((p) => {
            const t = projectTotals(p);
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="card p-5 hover:bg-[var(--background)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-sm text-[var(--muted)]">
                      {p.client.name}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    {duration(t.totalMinutes)}
                  </span>
                  <span className="font-medium">{money(t.revenue)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
