-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "external_id" INTEGER,
    "name" TEXT NOT NULL,
    "last_time_played" INTEGER,
    "is_installed" BOOLEAN NOT NULL DEFAULT false,
    "gameStatusId" INTEGER NOT NULL,
    "storefrontId" INTEGER,
    "gameTimePlayedId" TEXT,
    CONSTRAINT "Game_gameStatusId_fkey" FOREIGN KEY ("gameStatusId") REFERENCES "GameStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_gameTimePlayedId_fkey" FOREIGN KEY ("gameTimePlayedId") REFERENCES "GameTimePlayed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameTimePlayed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time_played" INTEGER NOT NULL DEFAULT 0,
    "time_played_windows" INTEGER NOT NULL DEFAULT 0,
    "time_played_linux" INTEGER NOT NULL DEFAULT 0,
    "time_played_mac" INTEGER NOT NULL DEFAULT 0,
    "time_played_steamdeck" INTEGER NOT NULL DEFAULT 0,
    "time_played_disconnected" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "GameStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Storefront" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameTimePlayedId_key" ON "Game"("gameTimePlayedId");

-- CreateIndex
CREATE UNIQUE INDEX "GameStatus_name_key" ON "GameStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_name_key" ON "Storefront"("name");
