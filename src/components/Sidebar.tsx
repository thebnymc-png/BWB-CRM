"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "▚" },
  { href: "/leads", label: "Leads", icon: "☎" },
  { href: "/clients", label: "Clients", icon: "☺" },
  { href: "/projects", label: "Projects", icon: "▤" },
  { href: "/time", label: "Time tracking", icon: "⏱" },
  { href: "/invoices", label: "Invoices", icon: "£" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <div className="text-lg font-semibold tracking-tight">BWB CRM</div>
        <div className="text-xs text-[var(--muted)]">Freelance design HQ</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--background)]"
              }`}
            >
              <span className="w-4 text-center opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 px-3 text-xs text-[var(--muted)]">
        Brown Web &amp; Branding
      </div>
    </aside>
  );
}
