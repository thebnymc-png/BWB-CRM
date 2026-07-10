"use client";

import { useEffect, useState } from "react";

function fmt(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TimerControl({
  projectId,
  running,
  startTimer,
  stopTimer,
}: {
  projectId: string;
  running: { id: string; startTime: string; description: string | null } | null;
  startTimer: (projectId: string, formData: FormData) => void;
  stopTimer: (id: string) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const start = new Date(running.startTime).getTime();
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  if (running) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Timer running
          </div>
          <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
            {fmt(elapsed)}
          </div>
          {running.description && (
            <div className="mt-1 text-sm text-[var(--muted)]">
              {running.description}
            </div>
          )}
        </div>
        <form action={stopTimer.bind(null, running.id)}>
          <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700">
            ■ Stop timer
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={startTimer.bind(null, projectId)}
      className="card flex flex-wrap items-center gap-3 p-5"
    >
      <input
        name="description"
        placeholder="What are you working on? (optional)"
        className="input flex-1 min-w-[200px]"
      />
      <button type="submit" className="btn-primary">
        ▶ Start timer
      </button>
    </form>
  );
}
