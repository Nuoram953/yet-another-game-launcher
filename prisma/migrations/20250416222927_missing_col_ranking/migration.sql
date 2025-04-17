/*
  Warnings:

  - Added the required column `updatedAt` to the `Ranking` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ranking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "maxItems" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rankingStatusId" INTEGER NOT NULL,
    CONSTRAINT "Ranking_rankingStatusId_fkey" FOREIGN KEY ("rankingStatusId") REFERENCES "RankingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ranking" ("id", "maxItems", "name", "rankingStatusId") SELECT "id", "maxItems", "name", "rankingStatusId" FROM "Ranking";
DROP TABLE "Ranking";
ALTER TABLE "new_Ranking" RENAME TO "Ranking";
CREATE UNIQUE INDEX "Ranking_name_key" ON "Ranking"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
