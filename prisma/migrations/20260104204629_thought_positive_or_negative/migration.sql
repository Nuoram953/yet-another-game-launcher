-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameReviewThoughts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isPositive" BOOLEAN NOT NULL DEFAULT false,
    "isNegative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameReviewThoughts_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameReviewThoughts" ("createdAt", "gameId", "id", "text", "updatedAt") SELECT "createdAt", "gameId", "id", "text", "updatedAt" FROM "GameReviewThoughts";
DROP TABLE "GameReviewThoughts";
ALTER TABLE "new_GameReviewThoughts" RENAME TO "GameReviewThoughts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
