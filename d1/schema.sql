-- Generated from prisma/migrations. Apply to Cloudflare D1 to create the schema.
-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "nextFollowUp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "convertedClientId" TEXT,
    CONSTRAINT "Lead_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "hourlyRate" REAL,
    "fixedFee" REAL,
    "budgetHours" REAL,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "TimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "username" TEXT,
    "password" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Credential_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "paidDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
