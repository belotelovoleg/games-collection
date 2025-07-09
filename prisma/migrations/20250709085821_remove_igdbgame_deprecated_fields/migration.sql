/*
  Warnings:

  - You are about to drop the column `category` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `collection_id` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `follows` on the `igdb_games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "igdb_games" DROP COLUMN "category",
DROP COLUMN "collection_id",
DROP COLUMN "follows";
