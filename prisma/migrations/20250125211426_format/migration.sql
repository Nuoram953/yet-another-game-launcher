/*
  Warnings:

  - A unique constraint covering the columns `[gameId,companyId]` on the table `GameDeveloper` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,companyId]` on the table `GamePublisher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameDeveloper_gameId_companyId_key" ON "GameDeveloper"("gameId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePublisher_gameId_companyId_key" ON "GamePublisher"("gameId", "companyId");
