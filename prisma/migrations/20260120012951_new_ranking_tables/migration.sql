-- CreateTable
CREATE TABLE "RankingTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RankingTagMap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "rankingId" INTEGER NOT NULL,
    "rankingTagId" INTEGER NOT NULL,
    CONSTRAINT "RankingTagMap_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingTagMap_rankingTagId_fkey" FOREIGN KEY ("rankingTagId") REFERENCES "RankingTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "rankingTagId" INTEGER,
    CONSTRAINT "Ranking_rankingStatusId_fkey" FOREIGN KEY ("rankingStatusId") REFERENCES "RankingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_rankingTagId_fkey" FOREIGN KEY ("rankingTagId") REFERENCES "RankingTag" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ranking" ("createdAt", "id", "maxItems", "name", "rankingStatusId", "updatedAt") SELECT "createdAt", "id", "maxItems", "name", "rankingStatusId", "updatedAt" FROM "Ranking";
DROP TABLE "Ranking";
ALTER TABLE "new_Ranking" RENAME TO "Ranking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RankingTag_name_key" ON "RankingTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RankingTagMap_name_key" ON "RankingTagMap"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RankingTagMap_rankingId_rankingTagId_key" ON "RankingTagMap"("rankingId", "rankingTagId");
