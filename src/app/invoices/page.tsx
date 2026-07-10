import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { money, formatDate } from "@/lib/format";
import { displayStatus, isOverdue } from "@/lib/invoice";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const db = await getDb();
  const invoices = await db.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { project: { include: { client: true } } },
  });

  const outstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((s, i) => s + i.amount, 0);
  const overdue = invoices
    .filter((i) => isOverdue(i))
    .reduce((s, i) => s + i.amount, 0);
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Billing and payment status"
        action={
          <Link href="/invoices/new" className="btn-primary">
            + New invoice
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value mt-1">{money(outstanding)}</div>
        </div>
        <div className="card p-5">
          <div className="stat-label">Overdue</div>
          <div className="stat-value mt-1 text-red-600">{money(overdue)}</div>
        </div>
        <div className="card p-5">
          <div className="stat-label">Paid</div>
          <div className="stat-value mt-1">{money(paid)}</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="mx-auto max-w-md text-[var(--muted)]">
            No invoices yet. Generate one from a project&apos;s billable time and
            costs.
          </p>
          <Link href="/invoices/new" className="btn-primary mt-4">
            + New invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="card min-w-[680px] divide-y divide-[var(--border)]">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              <div className="col-span-3">Invoice</div>
              <div className="col-span-4">Client / project</div>
              <div className="col-span-2">Due</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="grid grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-[var(--background)]"
              >
                <div className="col-span-3 min-w-0">
                  <div className="truncate font-medium">{inv.number}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {formatDate(inv.issueDate)}
                  </div>
                </div>
                <div className="col-span-4 min-w-0 text-sm">
                  <div className="truncate">{inv.project.client.name}</div>
                  <div className="truncate text-[var(--muted)]">
                    {inv.project.name}
                  </div>
                </div>
                <div className="col-span-2 text-sm text-[var(--muted)]">
                  {formatDate(inv.dueDate)}
                </div>
                <div className="col-span-1">
                  <StatusBadge status={displayStatus(inv)} />
                </div>
                <div className="col-span-2 text-right font-medium">
                  {money(inv.amount)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
