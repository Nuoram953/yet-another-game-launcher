/*
  Warnings:

  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" INTEGER,
    "name" TEXT NOT NULL,
    "lastTimePlayed" INTEGER,
    "isInstalled" BOOLEAN NOT NULL DEFAULT false,
    "gameStatusId" INTEGER NOT NULL,
    "storefrontId" INTEGER,
    "timePlayed" INTEGER NOT NULL DEFAULT 0,
    "timePlayedWindows" INTEGER NOT NULL DEFAULT 0,
    "timePlayedLinux" INTEGER NOT NULL DEFAULT 0,
    "timePlayedMac" INTEGER NOT NULL DEFAULT 0,
    "timePlayedSteamdeck" INTEGER NOT NULL DEFAULT 0,
    "timePlayedDisconnected" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Game_gameStatusId_fkey" FOREIGN KEY ("gameStatusId") REFERENCES "GameStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("externalId", "gameStatusId", "id", "isInstalled", "lastTimePlayed", "name", "storefrontId", "timePlayed", "timePlayedDisconnected", "timePlayedLinux", "timePlayedMac", "timePlayedSteamdeck", "timePlayedWindows") SELECT "externalId", "gameStatusId", "id", "isInstalled", "lastTimePlayed", "name", "storefrontId", "timePlayed", "timePlayedDisconnected", "timePlayedLinux", "timePlayedMac", "timePlayedSteamdeck", "timePlayedWindows" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_externalId_storefrontId_key" ON "Game"("externalId", "storefrontId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
