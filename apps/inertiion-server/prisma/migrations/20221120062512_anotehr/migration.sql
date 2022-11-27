/*
  Warnings:

  - You are about to drop the column `moreDescriptiom` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "moreDescriptiom",
ADD COLUMN     "moreDescription" TEXT;
