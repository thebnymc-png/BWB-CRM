import { PrismaClient } from "@/generated/prisma/client";

// One data-access helper that works in both environments:
//   • Local dev (`next dev`)      → better-sqlite3 against a local file (dev.db)
//   • Cloudflare Pages (workerd)  → Cloudflare D1 binding named `DB`
//
// On Cloudflare we must build a fresh client per request: a D1 binding is
// request-scoped and can't be reused across requests. Locally we cache a single
// better-sqlite3 client on the global.

type GlobalWithPrisma = typeof globalThis & { __prisma?: PrismaClient };
const g = globalThis as GlobalWithPrisma;

async function getCloudflareDbBinding(): Promise<unknown | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    return (ctx?.env as { DB?: unknown })?.DB ?? null;
  } catch {
    // Not running inside a Cloudflare worker.
    return null;
  }
}

export async function getDb(): Promise<PrismaClient> {
  // --- Cloudflare D1 (production) ---
  const dbBinding = await getCloudflareDbBinding();
  if (dbBinding) {
    const { PrismaD1 } = await import("@prisma/adapter-d1");
    return new PrismaClient({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adapter: new PrismaD1(dbBinding as any),
    });
  }

  // --- Local SQLite file (development) ---
  if (g.__prisma) return g.__prisma;
  const { PrismaBetterSqlite3 } = await import(
    "@prisma/adapter-better-sqlite3"
  );
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const client = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });
  g.__prisma = client;
  return client;
}
