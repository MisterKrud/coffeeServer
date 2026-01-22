/*
  Warnings:

  - You are about to drop the column `notes` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "notes";
