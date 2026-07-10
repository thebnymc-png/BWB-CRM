import Link from "next/link";
import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
