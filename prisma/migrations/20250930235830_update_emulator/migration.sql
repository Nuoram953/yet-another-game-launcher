/*
  Warnings:

  - You are about to drop the column `config` on the `Emulator` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `GameLaunchEmulation` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EmulatorOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emulatorId" INTEGER,
    "shortName" TEXT NOT NULL,
    "longName" TEXT NOT NULL,
    "description" TEXT,
    "defautlValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmulatorOption_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameLaunchEmulationOptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameLaunchEmulationId" INTEGER,
    "emulatorOptionId" INTEGER,
    "value" TEXT NOT NULL,
    CONSTRAINT "GameLaunchEmulationOptions_gameLaunchEmulationId_fkey" FOREIGN KEY ("gameLaunchEmulationId") REFERENCES "GameLaunchEmulation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulationOptions_emulatorOptionId_fkey" FOREIGN KEY ("emulatorOptionId") REFERENCES "EmulatorOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emulator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Emulator" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Emulator";
DROP TABLE "Emulator";
ALTER TABLE "new_Emulator" RENAME TO "Emulator";
CREATE UNIQUE INDEX "Emulator_name_key" ON "Emulator"("name");
CREATE TABLE "new_GameLaunchEmulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "emulatorId" INTEGER,
    "retroAchievementsId" TEXT,
    "emulatorOptionId" INTEGER,
    CONSTRAINT "GameLaunchEmulation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulation_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulation_emulatorOptionId_fkey" FOREIGN KEY ("emulatorOptionId") REFERENCES "EmulatorOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GameLaunchEmulation" ("emulatorId", "gameId", "id", "name", "retroAchievementsId") SELECT "emulatorId", "gameId", "id", "name", "retroAchievementsId" FROM "GameLaunchEmulation";
DROP TABLE "GameLaunchEmulation";
ALTER TABLE "new_GameLaunchEmulation" RENAME TO "GameLaunchEmulation";
CREATE TABLE "new_Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emulatorId" INTEGER,
    "emulatorOptionId" INTEGER,
    CONSTRAINT "Platform_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Platform_emulatorOptionId_fkey" FOREIGN KEY ("emulatorOptionId") REFERENCES "EmulatorOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Platform" ("createdAt", "emulatorId", "id", "name", "updatedAt") SELECT "createdAt", "emulatorId", "id", "name", "updatedAt" FROM "Platform";
DROP TABLE "Platform";
ALTER TABLE "new_Platform" RENAME TO "Platform";
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
