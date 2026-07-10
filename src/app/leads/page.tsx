import { PageHeader } from "@/components/PageHeader";

export default function LeadsPage() {
  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Cold calls, prospects and your sales pipeline"
      />
      <div className="card p-10 text-center">
        <p className="mx-auto max-w-md text-[var(--muted)]">
          The leads pipeline lands in the next pass — a Kanban-style board to
          track cold calls and prospects through{" "}
          <span className="font-medium text-[var(--foreground)]">
            new → contacted → qualified → proposal → won/lost
          </span>
          , with follow-up reminders and one-click conversion into a client.
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          The database is already set up for it, so it&apos;ll slot straight in.
        </p>
      </div>
    </div>
  );
}
