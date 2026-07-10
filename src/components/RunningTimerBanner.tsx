"use client";

import { useEffect, useState } from "react";

function fmt(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function RunningTimerBanner({
  entry,
  stopTimer,
}: {
  entry: {
    id: string;
    startTime: string;
    projectName: string;
    clientName: string;
    description: string | null;
  };
  stopTimer: (id: string) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(entry.startTime).getTime();
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [entry.startTime]);

  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-red-500 p-5">
      <div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Running · {entry.projectName} ({entry.clientName})
        </div>
        <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
          {fmt(elapsed)}
        </div>
        {entry.description && (
          <div className="mt-1 text-sm text-[var(--muted)]">
            {entry.description}
          </div>
        )}
      </div>
      <form action={stopTimer.bind(null, entry.id)}>
        <button
          type="submit"
          className="btn-primary bg-red-600 hover:bg-red-700"
        >
          ■ Stop timer
        </button>
      </form>
    </div>
  );
}
