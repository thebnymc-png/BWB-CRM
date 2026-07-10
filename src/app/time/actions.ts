"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}
function num(v: FormDataEntryValue | null): number {
  const n = Number((v ?? "").toString().trim());
  return Number.isFinite(n) ? n : 0;
}

function revalidateAll(projectId?: string) {
  revalidatePath("/time");
  revalidatePath("/");
  if (projectId) revalidatePath(`/projects/${projectId}`);
}

// Start a timer on a project. Enforces a single running timer by stopping any
// other timer that's currently going.
export async function startTimer(projectId: string, formData?: FormData) {
  const db = await getDb();
  const description = formData ? str(formData.get("description")) : null;

  const running = await db.timeEntry.findMany({ where: { endTime: null } });
  const now = new Date();
  for (const entry of running) {
    const minutes = Math.max(
      0,
      Math.round((now.getTime() - entry.startTime.getTime()) / 60000),
    );
    await db.timeEntry.update({
      where: { id: entry.id },
      data: { endTime: now, minutes },
    });
  }

  await db.timeEntry.create({
    data: { projectId, description, startTime: now, endTime: null },
  });
  revalidateAll(projectId);
}

// Same as startTimer, but reads the project from the form (used by the global
// time page where you pick which project to start against).
export async function startTimerForm(formData: FormData) {
  const projectId = str(formData.get("projectId"));
  if (!projectId) return;
  await startTimer(projectId, formData);
}

export async function stopTimer(id: string) {
  const db = await getDb();
  const entry = await db.timeEntry.findUnique({ where: { id } });
  if (!entry) return;
  const now = new Date();
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - entry.startTime.getTime()) / 60000),
  );
  await db.timeEntry.update({
    where: { id },
    data: { endTime: now, minutes },
  });
  revalidateAll(entry.projectId);
}

// Add a completed entry by hand (e.g. logging work you forgot to time).
export async function addManualEntry(projectId: string, formData: FormData) {
  const db = await getDb();
  const hours = num(formData.get("hours"));
  const mins = num(formData.get("minutes"));
  const total = Math.round(hours * 60 + mins);
  const dateStr = str(formData.get("date"));
  const start = dateStr ? new Date(dateStr) : new Date();
  const end = new Date(start.getTime() + total * 60000);

  await db.timeEntry.create({
    data: {
      projectId,
      description: str(formData.get("description")),
      startTime: start,
      endTime: end,
      minutes: total,
      billable: formData.get("billable") !== "off",
    },
  });
  revalidateAll(projectId);
}

export async function deleteTimeEntry(id: string) {
  const db = await getDb();
  const entry = await db.timeEntry.delete({ where: { id } });
  revalidateAll(entry.projectId);
}
