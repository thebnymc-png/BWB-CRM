"use client";

import { useOptimistic, useTransition, useState } from "react";
import Link from "next/link";

export type BoardLead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  nextFollowUp: string | null; // ISO or null
  convertedClientId: string | null;
};

const COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: "new", label: "New", accent: "border-t-indigo-400" },
  { key: "contacted", label: "Contacted", accent: "border-t-sky-400" },
  { key: "qualified", label: "Qualified", accent: "border-t-violet-400" },
  { key: "proposal", label: "Proposal", accent: "border-t-amber-400" },
  { key: "won", label: "Won", accent: "border-t-green-400" },
  { key: "lost", label: "Lost", accent: "border-t-red-400" },
];

function followUpState(iso: string | null): {
  label: string;
  cls: string;
} | null {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const day = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  const label = new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
  }).format(d);
  if (day < startOfToday) return { label: `Overdue · ${label}`, cls: "bg-red-100 text-red-700" };
  if (day === startOfToday) return { label: `Today`, cls: "bg-amber-100 text-amber-700" };
  return { label: `Follow up ${label}`, cls: "bg-gray-100 text-gray-600" };
}

export function LeadBoard({
  leads,
  updateLeadStatus,
}: {
  leads: BoardLead[];
  updateLeadStatus: (id: string, status: string) => void;
}) {
  const [, startTransition] = useTransition();
  const [optimisticLeads, moveOptimistic] = useOptimistic(
    leads,
    (state: BoardLead[], move: { id: string; status: string }) =>
      state.map((l) => (l.id === move.id ? { ...l, status: move.status } : l)),
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  function onDrop(status: string) {
    const id = dragId;
    setDragId(null);
    setOverCol(null);
    if (!id) return;
    const lead = optimisticLeads.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    startTransition(async () => {
      moveOptimistic({ id, status });
      await updateLeadStatus(id, status);
    });
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {COLUMNS.map((col) => {
          const items = optimisticLeads.filter((l) => l.status === col.key);
          return (
            <div
              key={col.key}
              data-status={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.key);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
              onDrop={() => onDrop(col.key)}
              className={`w-72 shrink-0 rounded-xl border-t-4 ${col.accent} bg-[var(--surface)] border border-[var(--border)] ${
                overCol === col.key ? "ring-2 ring-[var(--ring)]" : ""
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold capitalize">
                  {col.label}
                </span>
                <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {items.length}
                </span>
              </div>
              <div className="min-h-[120px] space-y-2 px-2 pb-3">
                {items.map((lead) => {
                  const fu = followUpState(lead.nextFollowUp);
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDragId(lead.id)}
                      onDragEnd={() => setDragId(null)}
                      className={`cursor-grab rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm active:cursor-grabbing ${
                        dragId === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {lead.name}
                      </Link>
                      {lead.company && (
                        <div className="truncate text-sm text-[var(--muted)]">
                          {lead.company}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {lead.source && (
                          <span className="badge bg-gray-100 text-gray-600">
                            {lead.source}
                          </span>
                        )}
                        {fu && (
                          <span className={`badge ${fu.cls}`}>{fu.label}</span>
                        )}
                        {lead.convertedClientId && (
                          <span className="badge bg-green-100 text-green-700">
                            Client
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
