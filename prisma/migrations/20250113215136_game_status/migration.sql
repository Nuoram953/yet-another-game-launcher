/*
  Warnings:

  - You are about to alter the column `endedAt` on the `GameActivity` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.
  - You are about to alter the column `startedAt` on the `GameActivity` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "startedAt" BIGINT NOT NULL,
    "endedAt" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "GameActivity_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameActivity" ("duration", "endedAt", "gameId", "id", "startedAt") SELECT "duration", "endedAt", "gameId", "id", "startedAt" FROM "GameActivity";
DROP TABLE "GameActivity";
ALTER TABLE "new_GameActivity" RENAME TO "GameActivity";
CREATE INDEX "GameActivity_gameId_idx" ON "GameActivity"("gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
