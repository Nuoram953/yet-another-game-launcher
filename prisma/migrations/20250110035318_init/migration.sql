-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" INTEGER,
    "name" TEXT NOT NULL,
    "lastTimePlayed" INTEGER,
    "isInstalled" BOOLEAN NOT NULL DEFAULT false,
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
    "timePlayed" INTEGER NOT NULL DEFAULT 0,
    "timePlayed_windows" INTEGER NOT NULL DEFAULT 0,
    "timePlayed_linux" INTEGER NOT NULL DEFAULT 0,
    "timePlayed_mac" INTEGER NOT NULL DEFAULT 0,
    "timePlayed_steamdeck" INTEGER NOT NULL DEFAULT 0,
    "timePlayed_disconnected" INTEGER NOT NULL DEFAULT 0
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
CREATE UNIQUE INDEX "Game_externalId_storefrontId_key" ON "Game"("externalId", "storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "GameStatus_name_key" ON "GameStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Storefront_name_key" ON "Storefront"("name");
