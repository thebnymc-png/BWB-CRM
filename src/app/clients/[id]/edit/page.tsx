import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ClientForm } from "../../ClientForm";
import { updateClient } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const client = await db.client.findUnique({ where: { id } });
  if (!client) notFound();

  const action = updateClient.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Edit ${client.name}`}
        back={{ href: `/clients/${id}`, label: client.name }}
      />
      <ClientForm
        action={action}
        client={client}
        cancelHref={`/clients/${id}`}
      />
    </div>
  );
}
