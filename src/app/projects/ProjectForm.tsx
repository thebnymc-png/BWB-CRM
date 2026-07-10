import { SubmitButton } from "@/components/SubmitButton";
import { toDateInput } from "@/lib/format";
import Link from "next/link";

type ProjectData = {
  id?: string;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  hourlyRate?: number | null;
  fixedFee?: number | null;
  budgetHours?: number | null;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
  clientId?: string | null;
};

export function ProjectForm({
  action,
  project,
  clients,
  defaultClientId,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  project?: ProjectData;
  clients: { id: string; name: string }[];
  defaultClientId?: string;
  cancelHref: string;
}) {
  const selectedClient = project?.clientId ?? defaultClientId ?? "";
  return (
    <form action={action} className="card max-w-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">
            Project name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={project?.name ?? ""}
            className="input"
            placeholder="Website redesign"
          />
        </div>

        <div>
          <label className="label" htmlFor="clientId">
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={selectedClient}
            className="select"
          >
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "active"}
            className="select"
          >
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="hourlyRate">
            Hourly rate
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={project?.hourlyRate ?? ""}
            className="input"
            placeholder="45"
          />
        </div>
        <div>
          <label className="label" htmlFor="fixedFee">
            Fixed fee
          </label>
          <input
            id="fixedFee"
            name="fixedFee"
            type="number"
            step="0.01"
            min="0"
            defaultValue={project?.fixedFee ?? ""}
            className="input"
            placeholder="Optional flat fee"
          />
        </div>

        <div>
          <label className="label" htmlFor="budgetHours">
            Budget (hours)
          </label>
          <input
            id="budgetHours"
            name="budgetHours"
            type="number"
            step="0.25"
            min="0"
            defaultValue={project?.budgetHours ?? ""}
            className="input"
            placeholder="Optional estimate"
          />
        </div>
        <div className="hidden sm:block" />

        <div>
          <label className="label" htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateInput(project?.startDate)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="dueDate">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={toDateInput(project?.dueDate)}
            className="input"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={project?.description ?? ""}
            className="textarea"
            placeholder="Scope, deliverables, anything worth remembering…"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <SubmitButton>
          {project?.id ? "Save changes" : "Create project"}
        </SubmitButton>
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
