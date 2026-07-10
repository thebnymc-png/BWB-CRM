"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}
function num(v: FormDataEntryValue | null): number | null {
  const s = (v ?? "").toString().trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function date(v: FormDataEntryValue | null): Date | null {
  const s = (v ?? "").toString().trim();
  if (s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createProject(formData: FormData) {
  const db = await getDb();
  const clientId = str(formData.get("clientId"));
  if (!clientId) throw new Error("A client is required");

  const project = await db.project.create({
    data: {
      name: str(formData.get("name")) ?? "Untitled project",
      description: str(formData.get("description")),
      status: str(formData.get("status")) ?? "active",
      hourlyRate: num(formData.get("hourlyRate")),
      fixedFee: num(formData.get("fixedFee")),
      budgetHours: num(formData.get("budgetHours")),
      startDate: date(formData.get("startDate")),
      dueDate: date(formData.get("dueDate")),
      clientId,
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const db = await getDb();
  const clientId = str(formData.get("clientId"));
  if (!clientId) throw new Error("A client is required");

  await db.project.update({
    where: { id },
    data: {
      name: str(formData.get("name")) ?? "Untitled project",
      description: str(formData.get("description")),
      status: str(formData.get("status")) ?? "active",
      hourlyRate: num(formData.get("hourlyRate")),
      fixedFee: num(formData.get("fixedFee")),
      budgetHours: num(formData.get("budgetHours")),
      startDate: date(formData.get("startDate")),
      dueDate: date(formData.get("dueDate")),
      clientId,
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  const db = await getDb();
  const project = await db.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath(`/clients/${project.clientId}`);
  redirect("/projects");
}

// --- Credentials (project vault) ---

export async function addCredential(projectId: string, formData: FormData) {
  const db = await getDb();
  await db.credential.create({
    data: {
      projectId,
      label: str(formData.get("label")) ?? "Login",
      url: str(formData.get("url")),
      username: str(formData.get("username")),
      password: str(formData.get("password")),
      notes: str(formData.get("notes")),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteCredential(id: string, projectId: string) {
  const db = await getDb();
  await db.credential.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}

// --- Expenses (project costs) ---

export async function addExpense(projectId: string, formData: FormData) {
  const db = await getDb();
  await db.expense.create({
    data: {
      projectId,
      description: str(formData.get("description")) ?? "Expense",
      amount: num(formData.get("amount")) ?? 0,
      billable: formData.get("billable") === "on",
      date: date(formData.get("date")) ?? new Date(),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteExpense(id: string, projectId: string) {
  const db = await getDb();
  await db.expense.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
