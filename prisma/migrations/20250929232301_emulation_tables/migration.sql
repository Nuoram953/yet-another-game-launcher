/*
  Warnings:

  - You are about to drop the `EmulatorPlatform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `website` on the `Emulator` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "EmulatorPlatform_emulatorId_platformId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmulatorPlatform";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GameLaunchEmulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "emulatorId" INTEGER,
    "retroAchievementsId" TEXT,
    "config" JSONB,
    CONSTRAINT "GameLaunchEmulation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulation_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emulator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Emulator" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Emulator";
DROP TABLE "Emulator";
ALTER TABLE "new_Emulator" RENAME TO "Emulator";
CREATE UNIQUE INDEX "Emulator_name_key" ON "Emulator"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
