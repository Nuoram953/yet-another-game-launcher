-- AlterTable
ALTER TABLE "GameLaunchStorefront" ADD COLUMN "externalId" TEXT;

INSERT INTO "GameLaunchStorefront" (gameId, name, isEnabled, storefrontId, externalId)
SELECT id, 'Steam', 1, 1, externalId
FROM "Game" WHERE storefrontId=1;

INSERT INTO "GameLaunchStorefront" (gameId, name, isEnabled, storefrontId, externalId)
SELECT id, 'Epic Game Store', 1, 2, externalId 
FROM "Game" WHERE storefrontId=2;
