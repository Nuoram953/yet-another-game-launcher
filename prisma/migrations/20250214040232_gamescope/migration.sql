-- CreateTable
CREATE TABLE "GameConfigGamescope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "isBorderless" BOOLEAN NOT NULL DEFAULT false,
    "isFullscreen" BOOLEAN NOT NULL DEFAULT false,
    "isFsr" BOOLEAN NOT NULL DEFAULT false,
    "isAllowUnfocused" BOOLEAN NOT NULL DEFAULT false,
    "isEnableSteamOverlay" BOOLEAN NOT NULL DEFAULT false,
    "isForceGrabCursor" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "refreshRate" INTEGER NOT NULL,
    CONSTRAINT "GameConfigGamescope_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GameConfigGamescope_gameId_key" ON "GameConfigGamescope"("gameId");
