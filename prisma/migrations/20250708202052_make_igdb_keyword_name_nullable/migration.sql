/*
  Warnings:

  - You are about to drop the column `consoleId` on the `games` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_consoleId_fkey";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "consoleId",
ADD COLUMN     "consoleIds" INTEGER[];

-- AlterTable
ALTER TABLE "igdb_keywords" ALTER COLUMN "name" DROP NOT NULL;
