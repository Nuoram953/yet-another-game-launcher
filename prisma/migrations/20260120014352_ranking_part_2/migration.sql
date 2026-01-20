/*
  Warnings:

  - You are about to drop the column `rankingTagId` on the `Ranking` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ranking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "maxItems" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rankingStatusId" INTEGER NOT NULL,
    CONSTRAINT "Ranking_rankingStatusId_fkey" FOREIGN KEY ("rankingStatusId") REFERENCES "RankingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ranking" ("createdAt", "id", "isPinned", "maxItems", "name", "rankingStatusId", "updatedAt") SELECT "createdAt", "id", "isPinned", "maxItems", "name", "rankingStatusId", "updatedAt" FROM "Ranking";
DROP TABLE "Ranking";
ALTER TABLE "new_Ranking" RENAME TO "Ranking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
