/*
  Warnings:

  - You are about to alter the column `debit` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `credit` on the `JournalEntry` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "debit" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "credit" SET DATA TYPE DECIMAL(15,2);

-- CreateIndex
CREATE INDEX "JournalEntry_recordId_idx" ON "JournalEntry"("recordId");

-- CreateIndex
CREATE INDEX "Record_userId_idx" ON "Record"("userId");
