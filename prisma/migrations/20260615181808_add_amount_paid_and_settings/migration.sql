-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "amountPaid" REAL;

-- CreateTable
CREATE TABLE "Settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
