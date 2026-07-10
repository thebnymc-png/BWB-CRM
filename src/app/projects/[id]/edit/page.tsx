import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ProjectForm } from "../../ProjectForm";
import { updateProject } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const [project, clients] = await Promise.all([
    db.project.findUnique({ where: { id } }),
    db.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Edit ${project.name}`}
        back={{ href: `/projects/${id}`, label: project.name }}
      />
      <ProjectForm
        action={action}
        project={project}
        clients={clients}
        cancelHref={`/projects/${id}`}
      />
    </div>
  );
}
