import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { RunningTimerBanner } from "@/components/RunningTimerBanner";
import { SubmitButton } from "@/components/SubmitButton";
import { duration, formatDateTime } from "@/lib/format";
import { startTimerForm, stopTimer, deleteTimeEntry } from "./actions";

export const dynamic = "force-dynamic";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function TimePage() {
  const db = await getDb();
  const [entries, projects] = await Promise.all([
    db.timeEntry.findMany({
      orderBy: { startTime: "desc" },
      include: { project: { include: { client: true } } },
      take: 200,
    }),
    db.project.findMany({
      where: { status: { in: ["active", "on_hold"] } },
      orderBy: { name: "asc" },
      include: { client: true },
    }),
  ]);

  const running = entries.find((e) => e.endTime === null) ?? null;
  const completed = entries.filter((e) => e.endTime !== null);

  // Totals
  const now = new Date();
  const todayKey = dayKey(now);
  const weekAgo = new Date(now.getTime() - 6 * 86400000);
  const todayMins = completed
    .filter((e) => dayKey(e.startTime) === todayKey)
    .reduce((s, e) => s + e.minutes, 0);
  const weekMins = completed
    .filter((e) => e.startTime >= weekAgo)
    .reduce((s, e) => s + e.minutes, 0);

  // Group completed by day
  const groups = new Map<string, typeof completed>();
  for (const e of completed) {
    const k = dayKey(e.startTime);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(e);
  }

  return (
    <div>
      <PageHeader
        title="Time tracking"
        subtitle={`${duration(todayMins)} today · ${duration(weekMins)} this week`}
      />

      {running ? (
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
      ) : projects.length > 0 ? (
        <form
          action={startTimerForm}
          className="card mb-6 flex flex-wrap items-end gap-3 p-5"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="label">Start a timer</label>
            <select name="projectId" required className="select" defaultValue="">
              <option value="" disabled>
                Choose a project…
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.client.name}
                </option>
              ))}
            </select>
          </div>
          <input
            name="description"
            placeholder="What are you working on?"
            className="input flex-1 min-w-[200px]"
          />
          <SubmitButton>▶ Start</SubmitButton>
        </form>
      ) : (
        <div className="card mb-6 p-6 text-center text-sm text-[var(--muted)]">
          No active projects.{" "}
          <Link href="/projects/new" className="text-[var(--primary)] underline">
            Create one
          </Link>{" "}
          to start tracking time.
        </div>
      )}

      {completed.length === 0 ? (
        <div className="card p-10 text-center text-sm text-[var(--muted)]">
          No time logged yet.
        </div>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([key, dayEntries]) => {
            const dayTotal = dayEntries.reduce((s, e) => s + e.minutes, 0);
            return (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">
                    {formatDateTime(dayEntries[0].startTime).split(",")[0] ||
                      key}
                  </h3>
                  <span className="text-sm text-[var(--muted)]">
                    {duration(dayTotal)}
                  </span>
                </div>
                <div className="card divide-y divide-[var(--border)]">
                  {dayEntries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-4 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/projects/${e.projectId}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {e.project.name}
                        </Link>
                        <div className="truncate text-xs text-[var(--muted)]">
                          {e.project.client.name}
                          {e.description ? ` · ${e.description}` : ""}
                          {!e.billable ? " · non-billable" : ""}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
