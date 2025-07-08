/*
  Warnings:

  - You are about to drop the column `genre` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `games` table. All the data in the column will be lost.
  - Added the required column `name` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "genre",
DROP COLUMN "imageUrl",
DROP COLUMN "title",
ADD COLUMN     "alternative_names" TEXT[],
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "franchises" TEXT[],
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "igdb_game_id" INTEGER,
ADD COLUMN     "multiplayer_modes" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "platforms" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "screenshot" TEXT,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "igdb_covers" (
    "id" INTEGER NOT NULL,
    "alpha_channel" BOOLEAN,
    "animated" BOOLEAN,
    "checksum" TEXT,
    "height" INTEGER,
    "image_id" TEXT,
    "url" TEXT,
    "width" INTEGER,

    CONSTRAINT "igdb_covers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_screenshots" (
    "id" INTEGER NOT NULL,
    "alpha_channel" BOOLEAN,
    "animated" BOOLEAN,
    "checksum" TEXT,
    "height" INTEGER,
    "image_id" TEXT,
    "url" TEXT,
    "width" INTEGER,

    CONSTRAINT "igdb_screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_artworks" (
    "id" INTEGER NOT NULL,
    "alpha_channel" BOOLEAN,
    "animated" BOOLEAN,
    "checksum" TEXT,
    "height" INTEGER,
    "image_id" TEXT,
    "url" TEXT,
    "width" INTEGER,

    CONSTRAINT "igdb_artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_genres" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,

    CONSTRAINT "igdb_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_franchises" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,

    CONSTRAINT "igdb_franchises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_multiplayer_modes" (
    "id" INTEGER NOT NULL,
    "campaign_coop" BOOLEAN,
    "checksum" TEXT,
    "dropin" BOOLEAN,
    "lancoop" BOOLEAN,
    "offline_coop" BOOLEAN,
    "offline_coop_max" INTEGER,
    "offline_max" INTEGER,
    "online_coop" BOOLEAN,
    "online_coop_max" INTEGER,
    "online_max" INTEGER,
    "splitscreen" BOOLEAN,
    "splitscreen_online" BOOLEAN,

    CONSTRAINT "igdb_multiplayer_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_games" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "cover_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "summary" TEXT,
    "storyline" TEXT,
    "url" TEXT,
    "aggregated_rating" DOUBLE PRECISION,
    "aggregated_rating_count" INTEGER,
    "rating" DOUBLE PRECISION,
    "rating_count" INTEGER,
    "total_rating" DOUBLE PRECISION,
    "total_rating_count" INTEGER,
    "first_release_date" BIGINT,
    "alternative_names" TEXT[],
    "platforms" INTEGER[],
    "igdb_data" TEXT,

    CONSTRAINT "igdb_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_screenshot_relations" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "screenshot_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_screenshot_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_artwork_relations" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "artwork_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_artwork_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_genre_relations" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_genre_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_franchise_relations" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "franchise_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_franchise_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_game_multiplayer_relations" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "multiplayer_mode_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_game_multiplayer_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "igdb_game_screenshot_relations_game_id_screenshot_id_key" ON "igdb_game_screenshot_relations"("game_id", "screenshot_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_game_artwork_relations_game_id_artwork_id_key" ON "igdb_game_artwork_relations"("game_id", "artwork_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_game_genre_relations_game_id_genre_id_key" ON "igdb_game_genre_relations"("game_id", "genre_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_game_franchise_relations_game_id_franchise_id_key" ON "igdb_game_franchise_relations"("game_id", "franchise_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_game_multiplayer_relations_game_id_multiplayer_mode_id_key" ON "igdb_game_multiplayer_relations"("game_id", "multiplayer_mode_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_igdb_game_id_fkey" FOREIGN KEY ("igdb_game_id") REFERENCES "igdb_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_games" ADD CONSTRAINT "igdb_games_cover_id_fkey" FOREIGN KEY ("cover_id") REFERENCES "igdb_covers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_screenshot_relations" ADD CONSTRAINT "igdb_game_screenshot_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_screenshot_relations" ADD CONSTRAINT "igdb_game_screenshot_relations_screenshot_id_fkey" FOREIGN KEY ("screenshot_id") REFERENCES "igdb_screenshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_artwork_relations" ADD CONSTRAINT "igdb_game_artwork_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_artwork_relations" ADD CONSTRAINT "igdb_game_artwork_relations_artwork_id_fkey" FOREIGN KEY ("artwork_id") REFERENCES "igdb_artworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_genre_relations" ADD CONSTRAINT "igdb_game_genre_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_genre_relations" ADD CONSTRAINT "igdb_game_genre_relations_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "igdb_genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_franchise_relations" ADD CONSTRAINT "igdb_game_franchise_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_franchise_relations" ADD CONSTRAINT "igdb_game_franchise_relations_franchise_id_fkey" FOREIGN KEY ("franchise_id") REFERENCES "igdb_franchises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_multiplayer_relations" ADD CONSTRAINT "igdb_game_multiplayer_relations_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "igdb_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_game_multiplayer_relations" ADD CONSTRAINT "igdb_game_multiplayer_relations_multiplayer_mode_id_fkey" FOREIGN KEY ("multiplayer_mode_id") REFERENCES "igdb_multiplayer_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
