// Invoice line-item helpers. Line items are snapshotted onto the invoice as
// JSON so an invoice never changes after the underlying time/costs do.

import { hoursFromMinutes } from "./format";

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type ProjectLike = {
  name: string;
  hourlyRate: number | null;
  fixedFee: number | null;
};
type EntryLike = { minutes: number; billable: boolean; invoiced: boolean };
type ExpenseLike = {
  description: string;
  amount: number;
  billable: boolean;
  invoiced: boolean;
};

// Build the candidate lines for a new invoice from a project's un-invoiced,
// billable time and costs. `includeFixedFee` adds the project's flat fee.
export function buildDraftLines(
  project: ProjectLike,
  timeEntries: EntryLike[],
  expenses: ExpenseLike[],
  includeFixedFee: boolean,
): LineItem[] {
  const lines: LineItem[] = [];

  const billableMinutes = timeEntries
    .filter((e) => e.billable && !e.invoiced)
    .reduce((s, e) => s + e.minutes, 0);
  const hours = hoursFromMinutes(billableMinutes);
  const rate = project.hourlyRate ?? 0;
  if (hours > 0 && rate > 0) {
    lines.push({
      description: "Design services",
      quantity: hours,
      unitPrice: rate,
      amount: round2(hours * rate),
    });
  }

  if (includeFixedFee && project.fixedFee && project.fixedFee > 0) {
    lines.push({
      description: "Project fee",
      quantity: 1,
      unitPrice: project.fixedFee,
      amount: project.fixedFee,
    });
  }

  for (const ex of expenses) {
    if (ex.billable && !ex.invoiced) {
      lines.push({
        description: ex.description,
        quantity: 1,
        unitPrice: ex.amount,
        amount: ex.amount,
      });
    }
  }

  return lines;
}

export function linesTotal(lines: LineItem[]): number {
  return round2(lines.reduce((s, l) => s + l.amount, 0));
}

export function parseLines(json: string | null): LineItem[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as LineItem[]) : [];
  } catch {
    return [];
  }
}

// An invoice is effectively overdue when it's been sent, has a due date in the
// past, and hasn't been paid. Stored status stays "sent"; this is for display.
export function isOverdue(invoice: {
  status: string;
  dueDate: Date | string | null;
}): boolean {
  if (invoice.status !== "sent" || !invoice.dueDate) return false;
  const due = new Date(invoice.dueDate);
  return due.getTime() < Date.now();
}

export function displayStatus(invoice: {
  status: string;
  dueDate: Date | string | null;
}): string {
  return isOverdue(invoice) ? "overdue" : invoice.status;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
