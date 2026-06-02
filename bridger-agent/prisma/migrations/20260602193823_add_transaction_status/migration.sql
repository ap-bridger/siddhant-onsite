/*
  Warnings:

  - Added the required column `status_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TransactionStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bank_account_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "pair_id" TEXT,
    "match_id" TEXT,
    "vendor" TEXT,
    "qbo_id" TEXT,
    "status_id" TEXT NOT NULL,
    CONSTRAINT "Transaction_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "TransactionStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_pair_id_fkey" FOREIGN KEY ("pair_id") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount_cents", "bank_account_id", "date", "description", "id", "match_id", "pair_id", "qbo_id", "vendor") SELECT "amount_cents", "bank_account_id", "date", "description", "id", "match_id", "pair_id", "qbo_id", "vendor" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_pair_id_key" ON "Transaction"("pair_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TransactionStatus_name_key" ON "TransactionStatus"("name");
