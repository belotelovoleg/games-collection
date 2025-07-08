-- CreateEnum
CREATE TYPE "UserConsoleStatus" AS ENUM ('OWNED', 'WISHLIST', 'SOLD');

-- CreateTable
CREATE TABLE "user_consoles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "console_id" INTEGER NOT NULL,
    "status" "UserConsoleStatus" NOT NULL DEFAULT 'OWNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consoles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_consoles_user_id_console_id_key" ON "user_consoles"("user_id", "console_id");

-- AddForeignKey
ALTER TABLE "user_consoles" ADD CONSTRAINT "user_consoles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consoles" ADD CONSTRAINT "user_consoles_console_id_fkey" FOREIGN KEY ("console_id") REFERENCES "consoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
