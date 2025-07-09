/*
  Warnings:

  - You are about to drop the column `photo` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "photo",
ADD COLUMN     "photos" TEXT[];
