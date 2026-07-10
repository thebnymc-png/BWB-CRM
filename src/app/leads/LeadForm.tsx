import { SubmitButton } from "@/components/SubmitButton";
import { toDateInput } from "@/lib/format";
import Link from "next/link";

type LeadData = {
  id?: string;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  status?: string | null;
  notes?: string | null;
  nextFollowUp?: Date | string | null;
};

export function LeadForm({
  action,
  lead,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  lead?: LeadData;
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
            defaultValue={lead?.name ?? ""}
            className="input"
            placeholder="Priya Patel"
          />
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            name="company"
            defaultValue={lead?.company ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Stage
          </label>
          <select
            id="status"
            name="status"
            defaultValue={lead?.status ?? "new"}
            className="select"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
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
            defaultValue={lead?.email ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={lead?.phone ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="source">
            Source
          </label>
          <input
            id="source"
            name="source"
            defaultValue={lead?.source ?? ""}
            className="input"
            placeholder="Cold call, referral, Instagram…"
          />
        </div>
        <div>
          <label className="label" htmlFor="nextFollowUp">
            Next follow-up
          </label>
          <input
            id="nextFollowUp"
            name="nextFollowUp"
            type="date"
            defaultValue={toDateInput(lead?.nextFollowUp)}
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
            defaultValue={lead?.notes ?? ""}
            className="textarea"
            placeholder="What they need, budget, what was said on the call…"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <SubmitButton>{lead?.id ? "Save changes" : "Create lead"}</SubmitButton>
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
