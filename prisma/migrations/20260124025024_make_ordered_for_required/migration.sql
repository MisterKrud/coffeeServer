/*
  Warnings:

  - Made the column `orderedFor` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "orderedFor" SET NOT NULL;
