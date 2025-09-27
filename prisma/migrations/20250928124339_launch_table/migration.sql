-- CreateTable
CREATE TABLE "GameLaunchStorefront" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "storefrontId" INTEGER NOT NULL,
    CONSTRAINT "GameLaunchStorefront_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameLaunchStorefront_storefrontId_fkey" FOREIGN KEY ("storefrontId") REFERENCES "Storefront" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameLaunchApp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "path" TEXT NOT NULL,
    CONSTRAINT "GameLaunchApp_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GamePlatform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "path" TEXT,
    CONSTRAINT "GamePlatform_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GamePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GamePlatform" ("gameId", "id", "platformId") SELECT "gameId", "id", "platformId" FROM "GamePlatform";
DROP TABLE "GamePlatform";
ALTER TABLE "new_GamePlatform" RENAME TO "GamePlatform";
CREATE UNIQUE INDEX "GamePlatform_gameId_platformId_key" ON "GamePlatform"("gameId", "platformId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GameLaunchStorefront_gameId_storefrontId_key" ON "GameLaunchStorefront"("gameId", "storefrontId");

-- CreateIndex
CREATE UNIQUE INDEX "GameLaunchApp_gameId_key" ON "GameLaunchApp"("gameId");
