/*
  Warnings:

  - You are about to drop the column `name` on the `RankingTagMap` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RankingTagMap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rankingId" INTEGER NOT NULL,
    "rankingTagId" INTEGER NOT NULL,
    CONSTRAINT "RankingTagMap_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingTagMap_rankingTagId_fkey" FOREIGN KEY ("rankingTagId") REFERENCES "RankingTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RankingTagMap" ("id", "rankingId", "rankingTagId") SELECT "id", "rankingId", "rankingTagId" FROM "RankingTagMap";
DROP TABLE "RankingTagMap";
ALTER TABLE "new_RankingTagMap" RENAME TO "RankingTagMap";
CREATE UNIQUE INDEX "RankingTagMap_rankingId_rankingTagId_key" ON "RankingTagMap"("rankingId", "rankingTagId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
