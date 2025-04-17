-- CreateTable
CREATE TABLE "Ranking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "maxItems" INTEGER NOT NULL DEFAULT 10,
    "rankingStatusId" INTEGER NOT NULL,
    CONSTRAINT "Ranking_rankingStatusId_fkey" FOREIGN KEY ("rankingStatusId") REFERENCES "RankingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RankingGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rank" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rankingId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "RankingGame_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "Ranking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RankingGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_name_key" ON "Ranking"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RankingStatus_name_key" ON "RankingStatus"("name");
