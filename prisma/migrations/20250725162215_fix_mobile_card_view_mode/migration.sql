/*
  Warnings:

  - You are about to drop the column `mobileCardViewMode` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "mobileCardViewMode";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "mobileCardViewMode" INTEGER NOT NULL DEFAULT 1;
