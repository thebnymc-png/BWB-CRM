"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

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

export async function createLead(formData: FormData) {
  const db = await getDb();
  await db.lead.create({
    data: {
      name: str(formData.get("name")) ?? "New lead",
      company: str(formData.get("company")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      source: str(formData.get("source")),
      status: str(formData.get("status")) ?? "new",
      notes: str(formData.get("notes")),
      nextFollowUp: date(formData.get("nextFollowUp")),
    },
  });
  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLead(id: string, formData: FormData) {
  const db = await getDb();
  await db.lead.update({
    where: { id },
    data: {
      name: str(formData.get("name")) ?? "New lead",
      company: str(formData.get("company")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      source: str(formData.get("source")),
      status: str(formData.get("status")) ?? "new",
      notes: str(formData.get("notes")),
      nextFollowUp: date(formData.get("nextFollowUp")),
    },
  });
  revalidatePath("/leads");
  redirect("/leads");
}

// Called by the Kanban board when a card is dragged to another column.
export async function updateLeadStatus(id: string, status: string) {
  if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) return;
  const db = await getDb();
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath("/leads");
}

export async function deleteLead(id: string) {
  const db = await getDb();
  await db.lead.delete({ where: { id } });
  revalidatePath("/leads");
  redirect("/leads");
}

// Turn a won lead into a client record and link the two.
export async function convertLeadToClient(id: string) {
  const db = await getDb();
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return;

  // Already converted? Just go to the existing client.
  if (lead.convertedClientId) {
    redirect(`/clients/${lead.convertedClientId}`);
  }

  const client = await db.client.create({
    data: {
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: "active",
      notes: lead.notes,
    },
  });

  await db.lead.update({
    where: { id },
    data: { status: "won", convertedClientId: client.id },
  });

  revalidatePath("/leads");
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}
