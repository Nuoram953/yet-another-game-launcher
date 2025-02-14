-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameConfigGamescope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "isEnableed" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_GameConfigGamescope" ("gameId", "height", "id", "isAllowUnfocused", "isBorderless", "isEnableSteamOverlay", "isForceGrabCursor", "isFsr", "isFullscreen", "refreshRate", "width") SELECT "gameId", "height", "id", "isAllowUnfocused", "isBorderless", "isEnableSteamOverlay", "isForceGrabCursor", "isFsr", "isFullscreen", "refreshRate", "width" FROM "GameConfigGamescope";
DROP TABLE "GameConfigGamescope";
ALTER TABLE "new_GameConfigGamescope" RENAME TO "GameConfigGamescope";
CREATE UNIQUE INDEX "GameConfigGamescope_gameId_key" ON "GameConfigGamescope"("gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
