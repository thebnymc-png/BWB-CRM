import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ProjectForm } from "../ProjectForm";
import { createProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const db = await getDb();
  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="New project"
        back={{ href: "/projects", label: "Projects" }}
      />
      {clients.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          You need a client first.{" "}
          <Link href="/clients/new" className="text-[var(--primary)] underline">
            Add a client
          </Link>
          .
        </div>
      ) : (
        <ProjectForm
          action={createProject}
          clients={clients}
          defaultClientId={clientId}
          cancelHref="/projects"
        />
      )}
    </div>
  );
}
