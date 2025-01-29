-- CreateTable
CREATE TABLE "Engine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GameEngine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    CONSTRAINT "GameEngine_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameEngine_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "isGenre" BOOLEAN NOT NULL DEFAULT false,
    "isTheme" BOOLEAN NOT NULL DEFAULT false,
    "isGameMode" BOOLEAN NOT NULL DEFAULT false,
    "isPlayerPerspective" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "GameTag_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameTag" ("gameId", "id", "isGameMode", "isGenre", "isTheme", "tagId") SELECT "gameId", "id", "isGameMode", "isGenre", "isTheme", "tagId" FROM "GameTag";
DROP TABLE "GameTag";
ALTER TABLE "new_GameTag" RENAME TO "GameTag";
CREATE UNIQUE INDEX "GameTag_gameId_tagId_key" ON "GameTag"("gameId", "tagId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Engine_name_key" ON "Engine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameEngine_gameId_engineId_key" ON "GameEngine"("gameId", "engineId");
