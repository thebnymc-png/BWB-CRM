import { PageHeader } from "@/components/PageHeader";

export default function InvoicesPage() {
  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Billing and payment status"
      />
      <div className="card p-10 text-center">
        <p className="mx-auto max-w-md text-[var(--muted)]">
          Invoicing lands in the next pass — generate an invoice from a
          project&apos;s tracked (billable) time and costs, track its status
          through{" "}
          <span className="font-medium text-[var(--foreground)]">
            draft → sent → paid / overdue
          </span>
          , and see what&apos;s outstanding across all clients.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Your billable hours and pass-through costs are already being tracked
          per project, ready to roll into invoices.
        </p>
      </div>
    </div>
  );
}
