/*
  Warnings:

  - You are about to drop the column `age_ratings` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `game_engines` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `game_modes` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `language_supports` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `player_perspectives` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `themes` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `videos` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `websites` on the `igdb_games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "igdb_games" DROP COLUMN "age_ratings",
DROP COLUMN "game_engines",
DROP COLUMN "game_modes",
DROP COLUMN "language_supports",
DROP COLUMN "player_perspectives",
DROP COLUMN "themes",
DROP COLUMN "videos",
DROP COLUMN "websites";
