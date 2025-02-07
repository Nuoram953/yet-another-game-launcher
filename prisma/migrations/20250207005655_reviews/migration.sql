-- CreateTable
CREATE TABLE "GameReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "isAdvanceReview" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL,
    "scoreGraphic" INTEGER,
    "scoreGameplay" INTEGER,
    "scoreStory" INTEGER,
    "scoreSound" INTEGER,
    "scoreContent" INTEGER,
    "review" TEXT,
    CONSTRAINT "GameReview_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GameReview_gameId_idx" ON "GameReview"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameReview_gameId_key" ON "GameReview"("gameId");
