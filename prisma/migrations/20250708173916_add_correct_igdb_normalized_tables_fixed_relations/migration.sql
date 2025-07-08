/*
  Warnings:

  - You are about to drop the column `platform` on the `games` table. All the data in the column will be lost.
  - The `platforms` column on the `games` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `alternative_names` column on the `igdb_games` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `consoleId` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "platform",
ADD COLUMN     "consoleId" INTEGER NOT NULL,
DROP COLUMN "platforms",
ADD COLUMN     "platforms" INTEGER[];

-- AlterTable
ALTER TABLE "igdb_games" ADD COLUMN     "age_ratings" INTEGER[],
ADD COLUMN     "bundles" INTEGER[],
ADD COLUMN     "category" INTEGER,
ADD COLUMN     "collection_id" INTEGER,
ADD COLUMN     "created_at" BIGINT,
ADD COLUMN     "dlcs" INTEGER[],
ADD COLUMN     "expanded_games" INTEGER[],
ADD COLUMN     "expansions" INTEGER[],
ADD COLUMN     "external_games" INTEGER[],
ADD COLUMN     "follows" INTEGER,
ADD COLUMN     "forks" INTEGER[],
ADD COLUMN     "franchise_id" INTEGER,
ADD COLUMN     "game_engines" INTEGER[],
ADD COLUMN     "game_localizations" INTEGER[],
ADD COLUMN     "game_modes" INTEGER[],
ADD COLUMN     "game_status" INTEGER,
ADD COLUMN     "game_type" INTEGER,
ADD COLUMN     "genres" INTEGER[],
ADD COLUMN     "hypes" INTEGER,
ADD COLUMN     "involved_companies" INTEGER[],
ADD COLUMN     "keywords" INTEGER[],
ADD COLUMN     "language_supports" INTEGER[],
ADD COLUMN     "parent_game_id" INTEGER,
ADD COLUMN     "player_perspectives" INTEGER[],
ADD COLUMN     "ports" INTEGER[],
ADD COLUMN     "release_dates" INTEGER[],
ADD COLUMN     "remakes" INTEGER[],
ADD COLUMN     "remasters" INTEGER[],
ADD COLUMN     "similar_games" INTEGER[],
ADD COLUMN     "standalone_expansions" INTEGER[],
ADD COLUMN     "themes" INTEGER[],
ADD COLUMN     "updated_at" BIGINT,
ADD COLUMN     "version_parent_id" INTEGER,
ADD COLUMN     "version_title" TEXT,
ADD COLUMN     "videos" INTEGER[],
ADD COLUMN     "websites" INTEGER[],
DROP COLUMN "alternative_names",
ADD COLUMN     "alternative_names" INTEGER[];

-- DropEnum
DROP TYPE "Platform";

-- CreateTable
CREATE TABLE "igdb_alternative_names" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "comment" TEXT,
    "game_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "igdb_alternative_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_alternative_name_relations" (
    "game_id" INTEGER NOT NULL,
    "alternative_name_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_alternative_name_relations_pkey" PRIMARY KEY ("game_id","alternative_name_id")
);

-- CreateTable
CREATE TABLE "igdb_game_modes" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,

    CONSTRAINT "igdb_game_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_player_perspectives" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,

    CONSTRAINT "igdb_player_perspectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_engines" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "companies" INTEGER[],
    "created_at" BIGINT,
    "description" TEXT,
    "logo_id" INTEGER,
    "name" TEXT NOT NULL,
    "platforms" INTEGER[],
    "slug" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,

    CONSTRAINT "igdb_game_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_themes" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,

    CONSTRAINT "igdb_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_keywords" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,

    CONSTRAINT "igdb_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_involved_companies" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "company_id" INTEGER,
    "created_at" BIGINT,
    "developer" BOOLEAN,
    "game_id" INTEGER,
    "porting" BOOLEAN,
    "publisher" BOOLEAN,
    "supporting" BOOLEAN,
    "updated_at" BIGINT,

    CONSTRAINT "igdb_involved_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_release_dates" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "date" BIGINT,
    "date_format_id" INTEGER,
    "game_id" INTEGER,
    "human" TEXT,
    "m" INTEGER,
    "platform_id" INTEGER,
    "release_region_id" INTEGER,
    "status_id" INTEGER,
    "updated_at" BIGINT,
    "y" INTEGER,

    CONSTRAINT "igdb_release_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_age_ratings" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "content_descriptions" INTEGER[],
    "organization_id" INTEGER,
    "rating_category_id" INTEGER,
    "rating_content_descriptions" INTEGER[],
    "rating_cover_url" TEXT,
    "synopsis" TEXT,

    CONSTRAINT "igdb_age_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_websites" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "game_id" INTEGER,
    "trusted" BOOLEAN,
    "type_id" INTEGER,
    "url" TEXT NOT NULL,

    CONSTRAINT "igdb_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_external_games" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "countries" INTEGER[],
    "created_at" BIGINT,
    "external_game_source_id" INTEGER,
    "game_id" INTEGER,
    "game_release_format_id" INTEGER,
    "name" TEXT,
    "platform_id" INTEGER,
    "uid" TEXT,
    "updated_at" BIGINT,
    "url" TEXT,
    "year" INTEGER,

    CONSTRAINT "igdb_external_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_videos" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "game_id" INTEGER,
    "name" TEXT,
    "video_id" TEXT,

    CONSTRAINT "igdb_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_language_supports" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "created_at" BIGINT,
    "game_id" INTEGER,
    "language_id" INTEGER,
    "language_support_type_id" INTEGER,
    "updated_at" BIGINT,

    CONSTRAINT "igdb_language_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_localizations" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "cover_id" INTEGER,
    "created_at" BIGINT,
    "game_id" INTEGER,
    "name" TEXT,
    "region_id" INTEGER,
    "updated_at" BIGINT,

    CONSTRAINT "igdb_game_localizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_mode_relations" (
    "game_id" INTEGER NOT NULL,
    "game_mode_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_mode_relations_pkey" PRIMARY KEY ("game_id","game_mode_id")
);

-- CreateTable
CREATE TABLE "igdb_game_player_perspective_relations" (
    "game_id" INTEGER NOT NULL,
    "player_perspective_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_player_perspective_relations_pkey" PRIMARY KEY ("game_id","player_perspective_id")
);

-- CreateTable
CREATE TABLE "igdb_game_engine_relations" (
    "game_id" INTEGER NOT NULL,
    "game_engine_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_engine_relations_pkey" PRIMARY KEY ("game_id","game_engine_id")
);

-- CreateTable
CREATE TABLE "igdb_game_theme_relations" (
    "game_id" INTEGER NOT NULL,
    "theme_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_theme_relations_pkey" PRIMARY KEY ("game_id","theme_id")
);

-- CreateTable
CREATE TABLE "igdb_game_keyword_relations" (
    "game_id" INTEGER NOT NULL,
    "keyword_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_keyword_relations_pkey" PRIMARY KEY ("game_id","keyword_id")
);

-- CreateTable
CREATE TABLE "igdb_game_involved_company_relations" (
    "game_id" INTEGER NOT NULL,
    "involved_company_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_involved_company_relations_pkey" PRIMARY KEY ("game_id","involved_company_id")
);

-- CreateTable
CREATE TABLE "igdb_game_release_date_relations" (
    "game_id" INTEGER NOT NULL,
    "release_date_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_release_date_relations_pkey" PRIMARY KEY ("game_id","release_date_id")
);

-- CreateTable
CREATE TABLE "igdb_game_age_rating_relations" (
    "game_id" INTEGER NOT NULL,
    "age_rating_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_age_rating_relations_pkey" PRIMARY KEY ("game_id","age_rating_id")
);

-- CreateTable
CREATE TABLE "igdb_game_website_relations" (
    "game_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_website_relations_pkey" PRIMARY KEY ("game_id","website_id")
);

-- CreateTable
CREATE TABLE "igdb_game_external_game_relations" (
    "game_id" INTEGER NOT NULL,
    "external_game_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_external_game_relations_pkey" PRIMARY KEY ("game_id","external_game_id")
);

-- CreateTable
CREATE TABLE "igdb_game_video_relations" (
    "game_id" INTEGER NOT NULL,
    "video_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_video_relations_pkey" PRIMARY KEY ("game_id","video_id")
);

-- CreateTable
CREATE TABLE "igdb_game_language_support_relations" (
    "game_id" INTEGER NOT NULL,
    "language_support_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_language_support_relations_pkey" PRIMARY KEY ("game_id","language_support_id")
);

-- CreateTable
CREATE TABLE "igdb_game_localization_relations" (
    "game_id" INTEGER NOT NULL,
    "game_localization_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_localization_relations_pkey" PRIMARY KEY ("game_id","game_localization_id")
);

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_consoleId_fkey" FOREIGN KEY ("consoleId") REFERENCES "consoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_alternative_name_relations" ADD CONSTRAINT "igdb_game_alternative_name_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_alternative_name_relations" ADD CONSTRAINT "igdb_game_alternative_name_relations_alternative_name_id_fkey" FOREIGN KEY ("alternative_name_id") REFERENCES "igdb_alternative_names"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_mode_relations" ADD CONSTRAINT "igdb_game_mode_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_mode_relations" ADD CONSTRAINT "igdb_game_mode_relations_game_mode_id_fkey" FOREIGN KEY ("game_mode_id") REFERENCES "igdb_game_modes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_player_perspective_relations" ADD CONSTRAINT "igdb_game_player_perspective_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_player_perspective_relations" ADD CONSTRAINT "igdb_game_player_perspective_relations_player_perspective__fkey" FOREIGN KEY ("player_perspective_id") REFERENCES "igdb_player_perspectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_engine_relations" ADD CONSTRAINT "igdb_game_engine_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_engine_relations" ADD CONSTRAINT "igdb_game_engine_relations_game_engine_id_fkey" FOREIGN KEY ("game_engine_id") REFERENCES "igdb_game_engines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_theme_relations" ADD CONSTRAINT "igdb_game_theme_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_theme_relations" ADD CONSTRAINT "igdb_game_theme_relations_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "igdb_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_keyword_relations" ADD CONSTRAINT "igdb_game_keyword_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_keyword_relations" ADD CONSTRAINT "igdb_game_keyword_relations_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "igdb_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_involved_company_relations" ADD CONSTRAINT "igdb_game_involved_company_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_involved_company_relations" ADD CONSTRAINT "igdb_game_involved_company_relations_involved_company_id_fkey" FOREIGN KEY ("involved_company_id") REFERENCES "igdb_involved_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_release_date_relations" ADD CONSTRAINT "igdb_game_release_date_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_release_date_relations" ADD CONSTRAINT "igdb_game_release_date_relations_release_date_id_fkey" FOREIGN KEY ("release_date_id") REFERENCES "igdb_release_dates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_age_rating_relations" ADD CONSTRAINT "igdb_game_age_rating_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_age_rating_relations" ADD CONSTRAINT "igdb_game_age_rating_relations_age_rating_id_fkey" FOREIGN KEY ("age_rating_id") REFERENCES "igdb_age_ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_website_relations" ADD CONSTRAINT "igdb_game_website_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_website_relations" ADD CONSTRAINT "igdb_game_website_relations_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "igdb_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_external_game_relations" ADD CONSTRAINT "igdb_game_external_game_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_external_game_relations" ADD CONSTRAINT "igdb_game_external_game_relations_external_game_id_fkey" FOREIGN KEY ("external_game_id") REFERENCES "igdb_external_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_video_relations" ADD CONSTRAINT "igdb_game_video_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_video_relations" ADD CONSTRAINT "igdb_game_video_relations_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "igdb_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_language_support_relations" ADD CONSTRAINT "igdb_game_language_support_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_language_support_relations" ADD CONSTRAINT "igdb_game_language_support_relations_language_support_id_fkey" FOREIGN KEY ("language_support_id") REFERENCES "igdb_language_supports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_localization_relations" ADD CONSTRAINT "igdb_game_localization_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_localization_relations" ADD CONSTRAINT "igdb_game_localization_relations_game_localization_id_fkey" FOREIGN KEY ("game_localization_id") REFERENCES "igdb_game_localizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
