/*
  Warnings:

  - The values [EXCELLENT,FAIR] on the enum `Condition` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Completeness" AS ENUM ('CIB', 'GAME_BOX', 'GAME_MANUAL', 'LOOSE');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('REGION_FREE', 'NTSC_U', 'NTSC_J', 'PAL');

-- AlterEnum
BEGIN;
CREATE TYPE "Condition_new" AS ENUM ('SEALED', 'MINT', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE', 'POOR');
ALTER TABLE "games" ALTER COLUMN "condition" DROP DEFAULT;
ALTER TABLE "games" ALTER COLUMN "condition" TYPE "Condition_new" USING ("condition"::text::"Condition_new");
ALTER TYPE "Condition" RENAME TO "Condition_old";
ALTER TYPE "Condition_new" RENAME TO "Condition";
DROP TYPE "Condition_old";
ALTER TABLE "games" ALTER COLUMN "condition" SET DEFAULT 'GOOD';
COMMIT;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "completeness" "Completeness" DEFAULT 'CIB',
ADD COLUMN     "discoloration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labelDamage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "region" "Region" DEFAULT 'REGION_FREE',
ADD COLUMN     "rentalSticker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reproduction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "testedWorking" BOOLEAN NOT NULL DEFAULT false;
