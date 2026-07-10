"use server";

import { getDb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

export async function createClient(formData: FormData) {
  const db = await getDb();
  const client = await db.client.create({
    data: {
      name: str(formData.get("name")) ?? "Untitled client",
      company: str(formData.get("company")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      website: str(formData.get("website")),
      address: str(formData.get("address")),
      notes: str(formData.get("notes")),
      status: str(formData.get("status")) ?? "active",
    },
  });
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const db = await getDb();
  await db.client.update({
    where: { id },
    data: {
      name: str(formData.get("name")) ?? "Untitled client",
      company: str(formData.get("company")),
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      website: str(formData.get("website")),
      address: str(formData.get("address")),
      notes: str(formData.get("notes")),
      status: str(formData.get("status")) ?? "active",
    },
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  const db = await getDb();
  await db.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
