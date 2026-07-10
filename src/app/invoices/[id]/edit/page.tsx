import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { toDateInput } from "@/lib/format";
import { updateInvoiceMeta } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) notFound();

  const action = updateInvoiceMeta.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`Edit ${invoice.number}`}
        back={{ href: `/invoices/${id}`, label: invoice.number }}
      />
      <form action={action} className="card max-w-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="number">
              Invoice number
            </label>
            <input
              id="number"
              name="number"
              defaultValue={invoice.number}
              className="input"
            />
          </div>
          <div className="hidden sm:block" />
          <div>
            <label className="label" htmlFor="issueDate">
              Issue date
            </label>
            <input
              id="issueDate"
              name="issueDate"
              type="date"
              defaultValue={toDateInput(invoice.issueDate)}
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
              defaultValue={toDateInput(invoice.dueDate)}
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
              defaultValue={invoice.notes ?? ""}
              className="textarea"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Line items and the total are locked once an invoice is created. To
          change what&apos;s billed, delete this invoice (its time &amp; costs are
          released) and generate a new one.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <SubmitButton>Save changes</SubmitButton>
          <Link href={`/invoices/${id}`} className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
