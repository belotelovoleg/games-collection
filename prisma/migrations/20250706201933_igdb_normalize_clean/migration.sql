-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('PLAYSTATION_1', 'PLAYSTATION_2', 'PLAYSTATION_3', 'PLAYSTATION_4', 'PLAYSTATION_5', 'XBOX', 'XBOX_360', 'XBOX_ONE', 'XBOX_SERIES', 'NINTENDO_SWITCH', 'NINTENDO_3DS', 'NINTENDO_WII', 'NINTENDO_WII_U', 'PC', 'OTHER');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('MINT', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "genre" TEXT,
    "developer" TEXT,
    "publisher" TEXT,
    "releaseYear" INTEGER,
    "price" DOUBLE PRECISION,
    "purchaseDate" TIMESTAMP(3),
    "notes" TEXT,
    "imageUrl" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consoles" (
    "id" SERIAL NOT NULL,
    "igdb_platform_id" INTEGER,
    "igdb_platform_version_id" INTEGER,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "abbreviation" TEXT,
    "alternative_name" TEXT,
    "generation" INTEGER,
    "platform_family" TEXT,
    "platform_type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_logos" (
    "id" INTEGER NOT NULL,
    "alpha_channel" BOOLEAN,
    "animated" BOOLEAN,
    "checksum" TEXT,
    "height" INTEGER,
    "image_id" TEXT,
    "url" TEXT,
    "width" INTEGER,

    CONSTRAINT "igdb_platform_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_families" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "igdb_platform_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_types" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "igdb_platform_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_company_logos" (
    "id" INTEGER NOT NULL,
    "alpha_channel" BOOLEAN,
    "animated" BOOLEAN,
    "checksum" TEXT,
    "height" INTEGER,
    "image_id" TEXT,
    "url" TEXT,
    "width" INTEGER,

    CONSTRAINT "igdb_company_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_companies" (
    "id" INTEGER NOT NULL,
    "change_date" BIGINT,
    "change_date_format_id" INTEGER,
    "changed_company_id" INTEGER,
    "checksum" TEXT,
    "country" INTEGER,
    "description" TEXT,
    "logo_id" INTEGER,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "slug" TEXT,
    "start_date" BIGINT,
    "start_date_format_id" INTEGER,
    "status_id" INTEGER,
    "url" TEXT,

    CONSTRAINT "igdb_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_website_types" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "igdb_website_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_websites" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "trusted" BOOLEAN NOT NULL DEFAULT false,
    "type_id" INTEGER,
    "url" TEXT NOT NULL,

    CONSTRAINT "igdb_platform_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platforms" (
    "id" INTEGER NOT NULL,
    "abbreviation" TEXT,
    "alternative_name" TEXT,
    "checksum" TEXT,
    "generation" INTEGER,
    "name" TEXT NOT NULL,
    "platform_family_id" INTEGER,
    "platform_logo_id" INTEGER,
    "platform_type_id" INTEGER,
    "slug" TEXT,
    "summary" TEXT,
    "url" TEXT,
    "igdb_data" TEXT,

    CONSTRAINT "igdb_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_versions" (
    "id" INTEGER NOT NULL,
    "checksum" TEXT,
    "connectivity" TEXT,
    "cpu" TEXT,
    "graphics" TEXT,
    "main_manufacturer_id" INTEGER,
    "media" TEXT,
    "memory" TEXT,
    "name" TEXT NOT NULL,
    "os" TEXT,
    "output" TEXT,
    "platform_logo_id" INTEGER,
    "resolutions" TEXT,
    "slug" TEXT,
    "sound" TEXT,
    "storage" TEXT,
    "summary" TEXT,
    "url" TEXT,
    "igdb_data" TEXT,

    CONSTRAINT "igdb_platform_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_version_relations" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "version_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_platform_version_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_website_relations" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "website_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_platform_website_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igdb_platform_version_company_relations" (
    "id" SERIAL NOT NULL,
    "platform_version_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "igdb_platform_version_company_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_platform_version_relations_platform_id_version_id_key" ON "igdb_platform_version_relations"("platform_id", "version_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_platform_website_relations_platform_id_website_id_key" ON "igdb_platform_website_relations"("platform_id", "website_id");

-- CreateIndex
CREATE UNIQUE INDEX "igdb_platform_version_company_relations_platform_version_id_key" ON "igdb_platform_version_company_relations"("platform_version_id", "company_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consoles" ADD CONSTRAINT "consoles_igdb_platform_id_fkey" FOREIGN KEY ("igdb_platform_id") REFERENCES "igdb_platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consoles" ADD CONSTRAINT "consoles_igdb_platform_version_id_fkey" FOREIGN KEY ("igdb_platform_version_id") REFERENCES "igdb_platform_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_companies" ADD CONSTRAINT "igdb_companies_logo_id_fkey" FOREIGN KEY ("logo_id") REFERENCES "igdb_company_logos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_companies" ADD CONSTRAINT "igdb_companies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "igdb_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_companies" ADD CONSTRAINT "igdb_companies_changed_company_id_fkey" FOREIGN KEY ("changed_company_id") REFERENCES "igdb_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_websites" ADD CONSTRAINT "igdb_platform_websites_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "igdb_website_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platforms" ADD CONSTRAINT "igdb_platforms_platform_family_id_fkey" FOREIGN KEY ("platform_family_id") REFERENCES "igdb_platform_families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platforms" ADD CONSTRAINT "igdb_platforms_platform_logo_id_fkey" FOREIGN KEY ("platform_logo_id") REFERENCES "igdb_platform_logos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platforms" ADD CONSTRAINT "igdb_platforms_platform_type_id_fkey" FOREIGN KEY ("platform_type_id") REFERENCES "igdb_platform_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_versions" ADD CONSTRAINT "igdb_platform_versions_main_manufacturer_id_fkey" FOREIGN KEY ("main_manufacturer_id") REFERENCES "igdb_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_versions" ADD CONSTRAINT "igdb_platform_versions_platform_logo_id_fkey" FOREIGN KEY ("platform_logo_id") REFERENCES "igdb_platform_logos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_version_relations" ADD CONSTRAINT "igdb_platform_version_relations_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "igdb_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_version_relations" ADD CONSTRAINT "igdb_platform_version_relations_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "igdb_platform_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_website_relations" ADD CONSTRAINT "igdb_platform_website_relations_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "igdb_platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_website_relations" ADD CONSTRAINT "igdb_platform_website_relations_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "igdb_platform_websites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_version_company_relations" ADD CONSTRAINT "igdb_platform_version_company_relations_platform_version_i_fkey" FOREIGN KEY ("platform_version_id") REFERENCES "igdb_platform_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "igdb_platform_version_company_relations" ADD CONSTRAINT "igdb_platform_version_company_relations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "igdb_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
