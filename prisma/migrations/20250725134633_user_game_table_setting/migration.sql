-- CreateTable
CREATE TABLE "user_game_table_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_game_table_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_game_table_settings_user_id_tableName_key" ON "user_game_table_settings"("user_id", "tableName");

-- AddForeignKey
ALTER TABLE "user_game_table_settings" ADD CONSTRAINT "user_game_table_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
