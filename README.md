# BWB CRM

A CRM & time tracker for a freelance design business — leads, clients, projects,
time tracking, project costs & revenue, and a per-project vault for hosting
logins and important info.

Built with **Next.js (App Router)**, **Prisma**, and **SQLite / Cloudflare D1**.
Runs locally on a file database and deploys to **Cloudflare Pages** on D1 with
the same schema.

## What's in this version

- **Dashboard** — revenue, outstanding, profit, hours this week, active projects/clients/leads.
- **Leads** — a drag-and-drop Kanban pipeline (new → contacted → qualified →
  proposal → won / lost) with source tags, follow-up dates (overdue highlighted),
  and one-click **convert-to-client**.
- **Clients** — full contact records, notes, status, and their projects.
- **Projects** — hourly rate / fixed fee / budget, status, dates.
  - **Time tracking** — a live start/stop timer plus manual entries, billable flag.
  - **Logins & hosting** — a per-project vault (cPanel, WordPress, DNS, etc.).
  - **Costs** — project expenses, optionally billed back to the client.
  - **Finance roll-up** — revenue (time + fee + billable costs), profit, hours.
- **Time** — one place to start a timer on any project and see your log by day.
- **Invoices** — generate an invoice from a project's un-billed billable time,
  costs and fixed fee; edit meta; track **draft → sent → paid** (auto-flags
  **overdue** past the due date); a print-ready view for **Save-as-PDF**; and an
  outstanding/overdue/paid summary. Deleting an invoice releases its time & costs
  so they can be re-billed.

> **Note on logins:** credentials are stored as entered (plain text), per the
> current setup. Keep access to the app and the database restricted. Encrypting
> the vault at rest is a straightforward follow-up if you want it later.

## Run it locally

```bash
npm install            # also runs `prisma generate`
npm run db:migrate     # creates prisma/dev.db from the schema (first run only)
npm run dev            # http://localhost:3000
```

Local dev uses a SQLite file at `prisma/dev.db` via the better-sqlite3 adapter.

Handy scripts:

- `npm run db:studio` — browse/edit the local database in Prisma Studio.
- `npm run db:migrate` — create/apply a migration after editing `schema.prisma`.

## Deploy to Cloudflare Pages (with D1)

The app is configured for [OpenNext](https://opennext.js.org/cloudflare) +
Cloudflare Workers, using a **D1** database (Cloudflare's SQLite). One-time setup:

```bash
# 1. Log in to Cloudflare
npx wrangler login

# 2. Create the D1 database
npm run cf:d1:create
#    → copy the printed "database_id" into wrangler.jsonc
#      (replace REPLACE_WITH_YOUR_D1_DATABASE_ID)

# 3. Create the tables in D1 (remote)
npm run cf:d1:init-remote

# 4. Build + deploy
npm run cf:deploy
```

Then in the Cloudflare dashboard you can attach your **custom domain** to the
Worker/Pages project.

To try the production build locally against a **local** D1 first:

```bash
npm run cf:d1:init-local   # create tables in the local D1
npm run cf:preview         # runs the built worker in the Workers runtime
```

### How the database is chosen

`src/lib/prisma.ts` picks the right database automatically:

- **On Cloudflare** it uses the `DB` D1 binding (a fresh client per request,
  since D1 bindings are request-scoped).
- **Locally** (no Cloudflare context) it falls back to the SQLite file.

The Prisma client is generated for the `workerd` runtime (see `schema.prisma`)
so the query-compiler WASM is imported statically — required by Cloudflare — and
it still runs fine under Node for local dev.

### Changing the schema

1. Edit `prisma/schema.prisma`.
2. `npm run db:migrate` (updates local dev.db + regenerates the client).
3. Regenerate the D1 schema file and re-apply it:
   `cp prisma/migrations/*/migration.sql d1/schema.sql` then
   `npm run cf:d1:init-remote` (for a fresh DB) — for an existing DB, apply just
   the new migration's SQL with `wrangler d1 execute bwb-crm-db --remote --file=...`.

Incremental D1 migrations (for a database that already has data) live in
`d1/` as numbered files, e.g. `d1/002_invoicing.sql` — paste one into the D1
Console when the schema changes. `d1/schema.sql` is always the full, current
schema for a fresh database.

## Currency

Amounts default to AUD, shown as `$` (`en-AU`). Override with the `CURRENCY` and
`CURRENCY_LOCALE` environment variables if you bill in another currency.
