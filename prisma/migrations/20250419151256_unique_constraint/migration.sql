/*
  Warnings:

  - A unique constraint covering the columns `[rankingId,gameId]` on the table `RankingGame` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RankingGame_rankingId_gameId_key" ON "RankingGame"("rankingId", "gameId");
