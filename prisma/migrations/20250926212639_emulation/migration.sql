-- CreateTable
CREATE TABLE "Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emulatorPlatformId" INTEGER,
    CONSTRAINT "Platform_emulatorPlatformId_fkey" FOREIGN KEY ("emulatorPlatformId") REFERENCES "EmulatorPlatform" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Emulator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emulatorPlatformId" INTEGER,
    CONSTRAINT "Emulator_emulatorPlatformId_fkey" FOREIGN KEY ("emulatorPlatformId") REFERENCES "EmulatorPlatform" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmulatorPlatform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GamePlatform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,
    CONSTRAINT "GamePlatform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GamePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "lastTimePlayed" BIGINT,
    "isInstalled" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isEmulation" BOOLEAN NOT NULL DEFAULT false,
    "isStorefront" BOOLEAN NOT NULL DEFAULT false,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "gameStatusId" INTEGER NOT NULL,
    "storefrontId" INTEGER,
    "timePlayed" INTEGER NOT NULL DEFAULT 0,
    "timePlayedWindows" INTEGER NOT NULL DEFAULT 0,
    "timePlayedLinux" INTEGER NOT NULL DEFAULT 0,
    "timePlayedMac" INTEGER NOT NULL DEFAULT 0,
    "timePlayedSteamdeck" INTEGER NOT NULL DEFAULT 0,
    "timePlayedDisconnected" INTEGER NOT NULL DEFAULT 0,
    "size" BIGINT DEFAULT 0,
    "location" TEXT,
    "hasAchievements" BOOLEAN NOT NULL DEFAULT false,
    "scoreCritic" INTEGER,
    "scoreCommunity" INTEGER,
    "scoreUser" INTEGER,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "releasedAt" DATETIME,
    "openedAt" DATETIME,
    "mainStory" INTEGER,
    "mainPlusExtra" INTEGER,
    "completionist" INTEGER,
    CONSTRAINT "Game_gameStatusId_fkey" FOREIGN KEY ("gameStatusId") REFERENCES "GameStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("completionist", "createdAt", "externalId", "gameStatusId", "hasAchievements", "id", "isFavorite", "isInstalled", "lastTimePlayed", "location", "mainPlusExtra", "mainStory", "name", "openedAt", "releasedAt", "scoreCommunity", "scoreCritic", "scoreUser", "size", "storefrontId", "summary", "timePlayed", "timePlayedDisconnected", "timePlayedLinux", "timePlayedMac", "timePlayedSteamdeck", "timePlayedWindows", "updatedAt") SELECT "completionist", "createdAt", "externalId", "gameStatusId", "hasAchievements", "id", "isFavorite", "isInstalled", "lastTimePlayed", "location", "mainPlusExtra", "mainStory", "name", "openedAt", "releasedAt", "scoreCommunity", "scoreCritic", "scoreUser", "size", "storefrontId", "summary", "timePlayed", "timePlayedDisconnected", "timePlayedLinux", "timePlayedMac", "timePlayedSteamdeck", "timePlayedWindows", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_externalId_storefrontId_key" ON "Game"("externalId", "storefrontId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Emulator_name_key" ON "Emulator"("name");
