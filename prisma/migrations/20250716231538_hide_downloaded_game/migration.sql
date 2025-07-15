-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DownloadHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" BIGINT NOT NULL,
    CONSTRAINT "DownloadHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DownloadHistory" ("createdAt", "gameId", "id") SELECT "createdAt", "gameId", "id" FROM "DownloadHistory";
DROP TABLE "DownloadHistory";
ALTER TABLE "new_DownloadHistory" RENAME TO "DownloadHistory";
CREATE INDEX "DownloadHistory_gameId_idx" ON "DownloadHistory"("gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
