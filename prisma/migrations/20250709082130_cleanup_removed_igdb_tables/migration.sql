/*
  Warnings:

  - You are about to drop the column `bundles` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `expanded_games` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `external_games` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `game_localizations` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `involved_companies` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `ports` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `release_dates` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the column `similar_games` on the `igdb_games` table. All the data in the column will be lost.
  - You are about to drop the `igdb_external_games` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_external_game_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_involved_company_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_keyword_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_localization_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_localizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_game_release_date_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_involved_companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_keywords` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `igdb_release_dates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "igdb_game_external_game_relations" DROP CONSTRAINT "igdb_game_external_game_relations_external_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_external_game_relations" DROP CONSTRAINT "igdb_game_external_game_relations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_involved_company_relations" DROP CONSTRAINT "igdb_game_involved_company_relations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_involved_company_relations" DROP CONSTRAINT "igdb_game_involved_company_relations_involved_company_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_keyword_relations" DROP CONSTRAINT "igdb_game_keyword_relations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_keyword_relations" DROP CONSTRAINT "igdb_game_keyword_relations_keyword_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_localization_relations" DROP CONSTRAINT "igdb_game_localization_relations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_localization_relations" DROP CONSTRAINT "igdb_game_localization_relations_game_localization_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_release_date_relations" DROP CONSTRAINT "igdb_game_release_date_relations_game_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_game_release_date_relations" DROP CONSTRAINT "igdb_game_release_date_relations_release_date_id_fkey";

-- AlterTable
ALTER TABLE "igdb_games" DROP COLUMN "bundles",
DROP COLUMN "expanded_games",
DROP COLUMN "external_games",
DROP COLUMN "game_localizations",
DROP COLUMN "involved_companies",
DROP COLUMN "keywords",
DROP COLUMN "ports",
DROP COLUMN "release_dates",
DROP COLUMN "similar_games";

-- AlterTable
ALTER TABLE "igdb_themes" ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "igdb_external_games";

-- DropTable
DROP TABLE "igdb_game_external_game_relations";

-- DropTable
DROP TABLE "igdb_game_involved_company_relations";

-- DropTable
DROP TABLE "igdb_game_keyword_relations";

-- DropTable
DROP TABLE "igdb_game_localization_relations";

-- DropTable
DROP TABLE "igdb_game_localizations";

-- DropTable
DROP TABLE "igdb_game_release_date_relations";

-- DropTable
DROP TABLE "igdb_involved_companies";

-- DropTable
DROP TABLE "igdb_keywords";

-- DropTable
DROP TABLE "igdb_release_dates";
