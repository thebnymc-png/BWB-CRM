import { SubmitButton } from "@/components/SubmitButton";
import Link from "next/link";

type ClientData = {
  id?: string;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  status?: string | null;
};

export function ClientForm({
  action,
  client,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  client?: ClientData;
  cancelHref: string;
}) {
  return (
    <form action={action} className="card max-w-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={client?.name ?? ""}
            className="input"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            name="company"
            defaultValue={client?.company ?? ""}
            className="input"
            placeholder="Acme Ltd"
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={client?.status ?? "active"}
            className="select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className="input"
            placeholder="jane@acme.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            className="input"
            placeholder="07123 456789"
          />
        </div>
        <div>
          <label className="label" htmlFor="website">
            Website
          </label>
          <input
            id="website"
            name="website"
            defaultValue={client?.website ?? ""}
            className="input"
            placeholder="acme.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            name="address"
            defaultValue={client?.address ?? ""}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={client?.notes ?? ""}
            className="textarea"
            placeholder="How you met, preferences, anything useful…"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <SubmitButton>{client?.id ? "Save changes" : "Create client"}</SubmitButton>
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
