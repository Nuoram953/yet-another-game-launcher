-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rank" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rankingId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "RankingGame_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RankingGame" ("createdAt", "gameId", "id", "rank", "rankingId", "updatedAt") SELECT "createdAt", "gameId", "id", "rank", "rankingId", "updatedAt" FROM "RankingGame";
DROP TABLE "RankingGame";
ALTER TABLE "new_RankingGame" RENAME TO "RankingGame";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
