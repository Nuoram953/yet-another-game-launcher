-- CreateTable
CREATE TABLE "DownloadHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    CONSTRAINT "DownloadHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DownloadHistory_gameId_idx" ON "DownloadHistory"("gameId");
