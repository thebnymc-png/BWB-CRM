-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "lineItems" TEXT;

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN "invoiceId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "billable", "createdAt", "date", "description", "id", "projectId") SELECT "amount", "billable", "createdAt", "date", "description", "id", "projectId" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
