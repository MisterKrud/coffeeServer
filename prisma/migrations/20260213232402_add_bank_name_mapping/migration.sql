/*
  Warnings:

  - A unique constraint covering the columns `[bankFingerprint]` on the table `TransactionRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TransactionRecord_userId_bankFingerprint_key";

-- CreateTable
CREATE TABLE "BankNameMapping" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankNameMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankNameMapping_bankName_key" ON "BankNameMapping"("bankName");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionRecord_bankFingerprint_key" ON "TransactionRecord"("bankFingerprint");

-- AddForeignKey
ALTER TABLE "BankNameMapping" ADD CONSTRAINT "BankNameMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
