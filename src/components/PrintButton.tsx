"use client";

export function PrintButton({
  className = "btn-ghost btn-sm",
  children = "Print / Save PDF",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {children}
    </button>
  );
}
