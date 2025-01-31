-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" INTEGER,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" BIGINT,
    CONSTRAINT "GameAchievement_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameAchievement" ("description", "externalId", "gameId", "id", "isHidden", "isUnlocked", "name", "rarity", "unlockedAt") SELECT "description", "externalId", "gameId", "id", "isHidden", "isUnlocked", "name", "rarity", "unlockedAt" FROM "GameAchievement";
DROP TABLE "GameAchievement";
ALTER TABLE "new_GameAchievement" RENAME TO "GameAchievement";
CREATE INDEX "GameAchievement_gameId_idx" ON "GameAchievement"("gameId");
CREATE UNIQUE INDEX "GameAchievement_gameId_externalId_key" ON "GameAchievement"("gameId", "externalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
