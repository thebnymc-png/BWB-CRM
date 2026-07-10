import { getDb } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { PrintButton } from "@/components/PrintButton";
import { money, formatDate } from "@/lib/format";
import { parseLines, displayStatus } from "@/lib/invoice";
import { setInvoiceStatus, deleteInvoice } from "../actions";

export const dynamic = "force-dynamic";

// Your business details on the invoice. Adjust to taste (or wire to env later).
const BUSINESS = {
  name: "Brown Web & Branding",
  tagline: "Freelance design",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { project: { include: { client: true } } },
  });
  if (!invoice) notFound();

  const lines = parseLines(invoice.lineItems);
  const client = invoice.project.client;
  const status = displayStatus(invoice);

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={invoice.number}
          subtitle={`${client.name} · ${invoice.project.name}`}
          back={{ href: "/invoices", label: "Invoices" }}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <PrintButton />
              <Link href={`/invoices/${id}/edit`} className="btn-ghost btn-sm">
                Edit
              </Link>
              <DeleteButton
                action={deleteInvoice.bind(null, id)}
                confirm={`Delete ${invoice.number}? The billed time & costs will be released so you can invoice them again.`}
              />
            </div>
          }
        />

        {/* Status actions */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--muted)]">Status:</span>
          <StatusBadge status={status} />
          <div className="ml-2 flex flex-wrap gap-2">
            <form action={setInvoiceStatus.bind(null, id, "draft")}>
              <button className="btn-ghost btn-sm" disabled={invoice.status === "draft"}>
                Draft
              </button>
            </form>
            <form action={setInvoiceStatus.bind(null, id, "sent")}>
              <button className="btn-ghost btn-sm" disabled={invoice.status === "sent"}>
                Mark as sent
              </button>
            </form>
            <form action={setInvoiceStatus.bind(null, id, "paid")}>
              <button
                className="btn-primary btn-sm"
                disabled={invoice.status === "paid"}
              >
                Mark as paid
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* The invoice document (also what prints) */}
      <div className="print-area card mx-auto max-w-3xl p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">{BUSINESS.name}</div>
            <div className="text-sm text-[var(--muted)]">{BUSINESS.tagline}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tracking-tight">INVOICE</div>
            <div className="text-sm text-[var(--muted)]">{invoice.number}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Bill to
            </div>
            <div className="mt-1 font-medium">{client.name}</div>
            {client.company && <div className="text-sm">{client.company}</div>}
            {client.email && (
              <div className="text-sm text-[var(--muted)]">{client.email}</div>
            )}
            {client.address && (
              <div className="text-sm text-[var(--muted)]">{client.address}</div>
            )}
          </div>
          <div className="sm:text-right">
            <div className="text-sm">
              <span className="text-[var(--muted)]">Issued: </span>
              {formatDate(invoice.issueDate)}
            </div>
            <div className="text-sm">
              <span className="text-[var(--muted)]">Due: </span>
              {formatDate(invoice.dueDate)}
            </div>
            <div className="mt-1 text-sm">
              <span className="text-[var(--muted)]">Project: </span>
              {invoice.project.name}
            </div>
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Rate</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {lines.map((l, i) => (
              <tr key={i}>
                <td className="py-2.5">{l.description}</td>
                <td className="py-2.5 text-right">{l.quantity}</td>
                <td className="py-2.5 text-right">{money(l.unitPrice)}</td>
                <td className="py-2.5 text-right">{money(l.amount)}</td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-[var(--muted)]">
                  No line items.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--foreground)]">
              <td colSpan={3} className="py-3 text-right font-semibold">
                Total
              </td>
              <td className="py-3 text-right text-lg font-bold">
                {money(invoice.amount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && (
          <div className="mt-8 border-t border-[var(--border)] pt-4 text-sm">
            <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Notes
            </div>
            <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {status === "paid" && invoice.paidDate && (
          <div className="mt-6 inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Paid {formatDate(invoice.paidDate)}
          </div>
        )}
      </div>
    </div>
  );
}
