-- CreateTable
CREATE TABLE "ExternalReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review" TEXT NOT NULL,
    "isPositive" BOOLEAN NOT NULL,
    "isCritic" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameExternalReviewMap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "externalReviewId" INTEGER NOT NULL,
    CONSTRAINT "GameExternalReviewMap_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameExternalReviewMap_externalReviewId_fkey" FOREIGN KEY ("externalReviewId") REFERENCES "ExternalReview" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GameExternalReviewMap_gameId_externalReviewId_key" ON "GameExternalReviewMap"("gameId", "externalReviewId");
