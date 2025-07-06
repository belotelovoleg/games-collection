-- DropForeignKey
ALTER TABLE "igdb_platform_version_company_relations" DROP CONSTRAINT "igdb_platform_version_company_relations_company_id_fkey";

-- DropForeignKey
ALTER TABLE "igdb_platform_version_company_relations" DROP CONSTRAINT "igdb_platform_version_company_relations_platform_version_i_fkey";

-- DropForeignKey
ALTER TABLE "igdb_platform_versions" DROP CONSTRAINT "igdb_platform_versions_main_manufacturer_id_fkey";
