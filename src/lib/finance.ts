// Money/time roll-ups for a project. Kept in one place so the dashboard and
// the project page agree on the numbers.

type EntryLike = { minutes: number; billable: boolean };
type ExpenseLike = { amount: number; billable: boolean };
type ProjectLike = {
  hourlyRate?: number | null;
  fixedFee?: number | null;
  budgetHours?: number | null;
  timeEntries: EntryLike[];
  expenses: ExpenseLike[];
};

export type ProjectTotals = {
  totalMinutes: number;
  billableMinutes: number;
  totalHours: number;
  billableHours: number;
  timeRevenue: number; // billable hours × rate
  fixedFee: number;
  billableExpenses: number; // costs passed through to the client
  totalExpenses: number; // all costs to the business
  revenue: number; // what the client owes: time + fixed fee + billable expenses
  profit: number; // revenue − all expenses
  budgetHours: number | null;
  budgetUsedPct: number | null;
};

export function projectTotals(project: ProjectLike): ProjectTotals {
  const totalMinutes = project.timeEntries.reduce((s, e) => s + e.minutes, 0);
  const billableMinutes = project.timeEntries
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.minutes, 0);

  const rate = project.hourlyRate ?? 0;
  const fixedFee = project.fixedFee ?? 0;
  const billableHours = billableMinutes / 60;
  const timeRevenue = billableHours * rate;

  const totalExpenses = project.expenses.reduce((s, e) => s + e.amount, 0);
  const billableExpenses = project.expenses
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.amount, 0);

  const revenue = timeRevenue + fixedFee + billableExpenses;
  const profit = revenue - totalExpenses;

  const budgetHours = project.budgetHours ?? null;
  const budgetUsedPct =
    budgetHours && budgetHours > 0
      ? Math.round((totalMinutes / 60 / budgetHours) * 100)
      : null;

  return {
    totalMinutes,
    billableMinutes,
    totalHours: totalMinutes / 60,
    billableHours,
    timeRevenue,
    fixedFee,
    billableExpenses,
    totalExpenses,
    revenue,
    profit,
    budgetHours,
    budgetUsedPct,
  };
}
