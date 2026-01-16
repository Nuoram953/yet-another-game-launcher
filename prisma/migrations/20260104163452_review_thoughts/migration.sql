/*
  Warnings:

  - You are about to drop the column `scoreContent` on the `GameReview` table. All the data in the column will be lost.
  - You are about to drop the column `scoreGameplay` on the `GameReview` table. All the data in the column will be lost.
  - You are about to drop the column `scoreGraphic` on the `GameReview` table. All the data in the column will be lost.
  - You are about to drop the column `scoreSound` on the `GameReview` table. All the data in the column will be lost.
  - You are about to drop the column `scoreStory` on the `GameReview` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "GameReviewThoughts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameReviewThoughts_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "isAdvanceReview" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "review" TEXT,
    CONSTRAINT "GameReview_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameReview" ("gameId", "id", "isAdvanceReview", "review", "score") SELECT "gameId", "id", "isAdvanceReview", "review", "score" FROM "GameReview";
DROP TABLE "GameReview";
ALTER TABLE "new_GameReview" RENAME TO "GameReview";
CREATE INDEX "GameReview_gameId_idx" ON "GameReview"("gameId");
CREATE UNIQUE INDEX "GameReview_gameId_key" ON "GameReview"("gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
