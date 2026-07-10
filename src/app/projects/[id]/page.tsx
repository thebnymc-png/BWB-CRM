import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { TimerControl } from "@/components/TimerControl";
import { CredentialItem } from "@/components/CredentialItem";
import { SubmitButton } from "@/components/SubmitButton";
import { projectTotals } from "@/lib/finance";
import { money, duration, formatDate, formatDateTime } from "@/lib/format";
import {
  deleteProject,
  addCredential,
  deleteCredential,
  addExpense,
  deleteExpense,
} from "../actions";
import {
  startTimer,
  stopTimer,
  addManualEntry,
  deleteTimeEntry,
} from "@/app/time/actions";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-4">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>}
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const project = await db.project.findUnique({
    where: { id },
    include: {
      client: true,
      timeEntries: { orderBy: { startTime: "desc" } },
      credentials: { orderBy: { createdAt: "asc" } },
      expenses: { orderBy: { date: "desc" } },
    },
  });
  if (!project) notFound();

  const t = projectTotals(project);
  const running = project.timeEntries.find((e) => e.endTime === null) ?? null;
  const completed = project.timeEntries.filter((e) => e.endTime !== null);

  return (
    <div>
      <PageHeader
        title={project.name}
        back={{ href: "/projects", label: "Projects" }}
        subtitle={undefined}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/projects/${id}/edit`} className="btn-ghost btn-sm">
              Edit
            </Link>
            <DeleteButton
              action={deleteProject.bind(null, id)}
              confirm={`Delete project “${project.name}” and all its time, costs and logins?`}
            />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <StatusBadge status={project.status} />
        <Link
          href={`/clients/${project.clientId}`}
          className="text-[var(--primary)] hover:underline"
        >
          {project.client.name}
        </Link>
        {project.hourlyRate ? (
          <span className="text-[var(--muted)]">
            {money(project.hourlyRate)}/hr
          </span>
        ) : null}
        {project.fixedFee ? (
          <span className="text-[var(--muted)]">
            {money(project.fixedFee)} fixed
          </span>
        ) : null}
        {project.dueDate ? (
          <span className="text-[var(--muted)]">
            Due {formatDate(project.dueDate)}
          </span>
        ) : null}
      </div>

      {/* Finance summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={money(t.revenue)} hint="time + fee + billable costs" />
        <Stat
          label="Profit"
          value={money(t.profit)}
          hint={`${money(t.totalExpenses)} costs`}
        />
        <Stat
          label="Time tracked"
          value={duration(t.totalMinutes)}
          hint={
            t.budgetHours
              ? `of ${t.budgetHours}h budget (${t.budgetUsedPct}%)`
              : `${duration(t.billableMinutes)} billable`
          }
        />
        <Stat
          label="Billable"
          value={duration(t.billableMinutes)}
          hint={money(t.timeRevenue)}
        />
      </div>

      {/* Timer */}
      <div className="mb-8">
        <TimerControl
          projectId={id}
          running={
            running
              ? {
                  id: running.id,
                  startTime: running.startTime.toISOString(),
                  description: running.description,
                }
              : null
          }
          startTimer={startTimer}
          stopTimer={stopTimer}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Time log */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Time log</h2>
            <span className="text-sm text-[var(--muted)]">
              {completed.length} {completed.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <details className="card mb-4 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              + Add time manually
            </summary>
            <form
              action={addManualEntry.bind(null, id)}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <div>
                <label className="label">Date</label>
                <input type="date" name="date" className="input" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">Hours</label>
                  <input
                    type="number"
                    name="hours"
                    min="0"
                    step="1"
                    placeholder="1"
                    className="input"
                  />
                </div>
                <div className="flex-1">
                  <label className="label">Minutes</label>
                  <input
                    type="number"
                    name="minutes"
                    min="0"
                    max="59"
                    step="1"
                    placeholder="30"
                    className="input"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <input
                  name="description"
                  className="input"
                  placeholder="Logo concepts, client call…"
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="billable" defaultChecked />
                Billable
              </label>
              <div className="sm:col-span-2">
                <SubmitButton>Add entry</SubmitButton>
              </div>
            </form>
          </details>

          {completed.length === 0 ? (
            <div className="card p-8 text-center text-sm text-[var(--muted)]">
              No time logged yet. Start the timer above or add an entry
              manually.
            </div>
          ) : (
            <div className="card divide-y divide-[var(--border)]">
              {completed.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm">
                      {e.description || (
                        <span className="text-[var(--muted)]">No note</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {formatDateTime(e.startTime)}
                      {!e.billable && " · non-billable"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      {duration(e.minutes)}
                    </span>
                    <DeleteButton
                      action={deleteTimeEntry.bind(null, e.id)}
                      confirm="Delete this time entry?"
                      label="✕"
                      className="text-[var(--muted)] hover:text-red-600 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar: vault + expenses */}
        <aside className="space-y-8">
          {/* Vault */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">Logins &amp; hosting</h2>
            <details className="card mb-3 p-4">
              <summary className="cursor-pointer text-sm font-medium">
                + Add login / info
              </summary>
              <form
                action={addCredential.bind(null, id)}
                className="mt-4 space-y-3"
              >
                <input
                  name="label"
                  required
                  placeholder="Label (cPanel, WordPress…)"
                  className="input"
                />
                <input name="url" placeholder="URL" className="input" />
                <input
                  name="username"
                  placeholder="Username / email"
                  className="input"
                />
                <input
                  name="password"
                  placeholder="Password / key"
                  className="input"
                />
                <input name="notes" placeholder="Notes" className="input" />
                <SubmitButton>Save</SubmitButton>
              </form>
            </details>

            {project.credentials.length === 0 ? (
              <div className="card p-6 text-center text-sm text-[var(--muted)]">
                No logins saved.
              </div>
            ) : (
              <div className="card divide-y divide-[var(--border)]">
                {project.credentials.map((c) => (
                  <CredentialItem
                    key={c.id}
                    credential={c}
                    onDelete={deleteCredential.bind(null, c.id, id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Expenses */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Costs</h2>
              <span className="text-sm text-[var(--muted)]">
                {money(t.totalExpenses)}
              </span>
            </div>
            <details className="card mb-3 p-4">
              <summary className="cursor-pointer text-sm font-medium">
                + Add cost
              </summary>
              <form
                action={addExpense.bind(null, id)}
                className="mt-4 space-y-3"
              >
                <input
                  name="description"
                  required
                  placeholder="Stock photos, plugin, hosting…"
                  className="input"
                />
                <div className="flex gap-3">
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Amount"
                    className="input"
                  />
                  <input type="date" name="date" className="input" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="billable" />
                  Bill back to client
                </label>
                <SubmitButton>Add cost</SubmitButton>
              </form>
            </details>

            {project.expenses.length === 0 ? (
              <div className="card p-6 text-center text-sm text-[var(--muted)]">
                No costs logged.
              </div>
            ) : (
              <div className="card divide-y divide-[var(--border)]">
                {project.expenses.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm">{ex.description}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {formatDate(ex.date)}
                        {ex.billable && " · billable"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{money(ex.amount)}</span>
                      <DeleteButton
                        action={deleteExpense.bind(null, ex.id, id)}
                        confirm="Delete this cost?"
                        label="✕"
                        className="text-[var(--muted)] hover:text-red-600 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      {project.description && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          <div className="card whitespace-pre-wrap p-5 text-sm">
            {project.description}
          </div>
        </section>
      )}
    </div>
  );
}
