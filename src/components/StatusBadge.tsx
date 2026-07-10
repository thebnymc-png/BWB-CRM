const styles: Record<string, string> = {
  // clients
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  archived: "bg-gray-100 text-gray-500",
  // projects
  on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
  // leads
  new: "bg-indigo-100 text-indigo-700",
  contacted: "bg-sky-100 text-sky-700",
  qualified: "bg-violet-100 text-violet-700",
  proposal: "bg-amber-100 text-amber-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-600",
  // invoices
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-sky-100 text-sky-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? "bg-gray-100 text-gray-600";
  const label = status.replace(/_/g, " ");
  return <span className={`badge ${cls} capitalize`}>{label}</span>;
}
