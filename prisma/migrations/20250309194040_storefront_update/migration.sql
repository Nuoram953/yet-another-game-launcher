-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Storefront" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "hasLauncher" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Storefront" ("id", "name") SELECT "id", "name" FROM "Storefront";
DROP TABLE "Storefront";
ALTER TABLE "new_Storefront" RENAME TO "Storefront";
CREATE UNIQUE INDEX "Storefront_name_key" ON "Storefront"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
