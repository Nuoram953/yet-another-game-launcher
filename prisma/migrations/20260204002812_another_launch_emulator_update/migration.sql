/*
  Warnings:

  - Made the column `path` on table `GameLaunchEmulation` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameLaunchEmulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "emulatorId" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "retroAchievementsId" TEXT,
    "path" TEXT NOT NULL,
    "emulatorOptionId" INTEGER,
    CONSTRAINT "GameLaunchEmulation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulation_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchEmulation_emulatorOptionId_fkey" FOREIGN KEY ("emulatorOptionId") REFERENCES "EmulatorOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GameLaunchEmulation" ("emulatorId", "emulatorOptionId", "gameId", "id", "isEnabled", "name", "path", "retroAchievementsId") SELECT "emulatorId", "emulatorOptionId", "gameId", "id", "isEnabled", "name", "path", "retroAchievementsId" FROM "GameLaunchEmulation";
DROP TABLE "GameLaunchEmulation";
ALTER TABLE "new_GameLaunchEmulation" RENAME TO "GameLaunchEmulation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
