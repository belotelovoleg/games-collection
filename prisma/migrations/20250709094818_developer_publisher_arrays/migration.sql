/*
  Warnings:

  - The `developer` column on the `games` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `publisher` column on the `games` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "developer",
ADD COLUMN     "developer" TEXT[],
DROP COLUMN "publisher",
ADD COLUMN     "publisher" TEXT[];
