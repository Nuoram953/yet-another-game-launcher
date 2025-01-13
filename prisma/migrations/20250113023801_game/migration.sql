-- CreateTable
CREATE TABLE "GameActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "startedAt" TEXT NOT NULL,
    "endedAt" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "GameActivity_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GameActivity_gameId_idx" ON "GameActivity"("gameId");
