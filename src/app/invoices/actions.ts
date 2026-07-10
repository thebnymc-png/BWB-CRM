"use server";

import { getDb } from "@/lib/prisma";
import { buildDraftLines, linesTotal } from "@/lib/invoice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}
function date(v: FormDataEntryValue | null): Date | null {
  const s = (v ?? "").toString().trim();
  if (s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Create an invoice from a project's un-invoiced billable time & costs.
export async function generateInvoice(projectId: string, formData: FormData) {
  const db = await getDb();
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { timeEntries: true, expenses: true },
  });
  if (!project) throw new Error("Project not found");

  const includeFixedFee = formData.get("includeFixedFee") === "on";
  const lines = buildDraftLines(
    project,
    project.timeEntries,
    project.expenses,
    includeFixedFee,
  );
  const amount = linesTotal(lines);

  const number =
    str(formData.get("number")) ?? `INV-${Date.now().toString().slice(-6)}`;
  const issueDate = date(formData.get("issueDate")) ?? new Date();
  const dueDate = date(formData.get("dueDate"));

  const invoice = await db.invoice.create({
    data: {
      projectId,
      number,
      amount,
      status: "draft",
      issueDate,
      dueDate,
      notes: str(formData.get("notes")),
      lineItems: JSON.stringify(lines),
    },
  });

  // Mark the billed time & costs so they aren't invoiced twice.
  await db.timeEntry.updateMany({
    where: { projectId, billable: true, invoiced: false },
    data: { invoiced: true, invoiceId: invoice.id },
  });
  await db.expense.updateMany({
    where: { projectId, billable: true, invoiced: false },
    data: { invoiced: true, invoiceId: invoice.id },
  });

  revalidatePath("/invoices");
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceMeta(id: string, formData: FormData) {
  const db = await getDb();
  await db.invoice.update({
    where: { id },
    data: {
      number: str(formData.get("number")) ?? "INV",
      issueDate: date(formData.get("issueDate")) ?? new Date(),
      dueDate: date(formData.get("dueDate")),
      notes: str(formData.get("notes")),
    },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function setInvoiceStatus(id: string, status: string) {
  const db = await getDb();
  await db.invoice.update({
    where: { id },
    data: {
      status,
      paidDate: status === "paid" ? new Date() : null,
    },
  });
  revalidatePath("/invoices");
  revalidatePath("/");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  const db = await getDb();
  const invoice = await db.invoice.findUnique({ where: { id } });
  // Release the time & costs so they can be invoiced again.
  await db.timeEntry.updateMany({
    where: { invoiceId: id },
    data: { invoiced: false, invoiceId: null },
  });
  await db.expense.updateMany({
    where: { invoiceId: id },
    data: { invoiced: false, invoiceId: null },
  });
  await db.invoice.delete({ where: { id } });

  revalidatePath("/invoices");
  revalidatePath("/");
  if (invoice) revalidatePath(`/projects/${invoice.projectId}`);
  redirect("/invoices");
}
