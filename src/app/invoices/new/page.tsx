import { getDb } from "@/lib/prisma";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { money, duration, hoursFromMinutes, toDateInput } from "@/lib/format";
import { buildDraftLines, linesTotal } from "@/lib/invoice";
import { generateInvoice } from "../actions";

export const dynamic = "force-dynamic";

function billableUninvoicedMinutes(
  entries: { minutes: number; billable: boolean; invoiced: boolean }[],
): number {
  return entries
    .filter((e) => e.billable && !e.invoiced)
    .reduce((s, e) => s + e.minutes, 0);
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const db = await getDb();

  // Step 1 — no project chosen: list projects with something to bill.
  if (!projectId) {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        timeEntries: { select: { minutes: true, billable: true, invoiced: true } },
        expenses: { select: { amount: true, billable: true, invoiced: true } },
      },
    });

    return (
      <div>
        <PageHeader
          title="New invoice"
          subtitle="Choose a project to bill"
          back={{ href: "/invoices", label: "Invoices" }}
        />
        {projects.length === 0 ? (
          <div className="card p-8 text-center text-sm text-[var(--muted)]">
            No projects yet.{" "}
            <Link href="/projects/new" className="text-[var(--primary)] underline">
              Create one
            </Link>
            .
          </div>
        ) : (
          <div className="card divide-y divide-[var(--border)]">
            {projects.map((p) => {
              const mins = billableUninvoicedMinutes(p.timeEntries);
              const uninvExpenses = p.expenses
                .filter((e) => e.billable && !e.invoiced)
                .reduce((s, e) => s + e.amount, 0);
              const timeValue =
                hoursFromMinutes(mins) * (p.hourlyRate ?? 0);
              const estimate = timeValue + uninvExpenses;
              return (
                <Link
                  key={p.id}
                  href={`/invoices/new?projectId=${p.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--background)]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-sm text-[var(--muted)]">
                      {p.client.name} · {duration(mins)} unbilled
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-[var(--muted)]">
                    ~{money(estimate)}
                    {p.fixedFee ? " + fee" : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Step 2 — project chosen: preview lines and confirm.
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { client: true, timeEntries: true, expenses: true },
  });
  if (!project) {
    return (
      <div>
        <PageHeader title="New invoice" back={{ href: "/invoices", label: "Invoices" }} />
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          Project not found.
        </div>
      </div>
    );
  }

  const timeLines = buildDraftLines(
    project,
    project.timeEntries,
    project.expenses,
    false,
  );
  const subtotal = linesTotal(timeLines);
  const invoiceCount = await db.invoice.count();
  const suggestedNumber = `INV-${String(invoiceCount + 1).padStart(4, "0")}`;
  const today = new Date();
  const due = new Date(today.getTime() + 14 * 86400000);

  const hasFee = !!project.fixedFee && project.fixedFee > 0;
  const nothingToBill = timeLines.length === 0 && !hasFee;

  const action = generateInvoice.bind(null, projectId);

  return (
    <div>
      <PageHeader
        title="New invoice"
        subtitle={`${project.client.name} · ${project.name}`}
        back={{ href: "/invoices/new", label: "Choose project" }}
      />

      {nothingToBill ? (
        <div className="card p-8 text-center text-sm text-[var(--muted)]">
          Nothing to bill on this project yet — no un-invoiced billable time,
          costs or fixed fee.
        </div>
      ) : (
        <form action={action} className="card max-w-2xl p-6">
          {/* Line preview */}
          <h2 className="mb-2 text-sm font-semibold">Lines</h2>
          <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--background)] text-left text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {timeLines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{l.description}</td>
                    <td className="px-3 py-2 text-right">{l.quantity}</td>
                    <td className="px-3 py-2 text-right">{money(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right">{money(l.amount)}</td>
                  </tr>
                ))}
                {timeLines.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-[var(--muted)]"
                    >
                      No billable time or costs — bill the fixed fee below.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasFee && (
            <label className="mb-4 flex items-center gap-2 text-sm">
              <input type="checkbox" name="includeFixedFee" defaultChecked />
              Include project fixed fee ({money(project.fixedFee)})
            </label>
          )}

          <p className="mb-5 text-sm text-[var(--muted)]">
            Subtotal of time &amp; costs: <strong>{money(subtotal)}</strong>
            {hasFee && " (fixed fee added on top if ticked)"}. The final total is
            calculated when you create the invoice.
          </p>

          {/* Meta */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="number">
                Invoice number
              </label>
              <input
                id="number"
                name="number"
                defaultValue={suggestedNumber}
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
                defaultValue={toDateInput(today)}
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
                defaultValue={toDateInput(due)}
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
                className="textarea"
                placeholder="Payment terms, bank details, thank-you note…"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <SubmitButton>Create invoice</SubmitButton>
            <Link href="/invoices/new" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
