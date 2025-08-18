-- CreateTable
CREATE TABLE "guest_platform_permissions" (
    "id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "console_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_platform_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_platform_permissions_guest_id_console_id_key" ON "guest_platform_permissions"("guest_id", "console_id");

-- AddForeignKey
ALTER TABLE "guest_platform_permissions" ADD CONSTRAINT "guest_platform_permissions_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_platform_permissions" ADD CONSTRAINT "guest_platform_permissions_console_id_fkey" FOREIGN KEY ("console_id") REFERENCES "consoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
