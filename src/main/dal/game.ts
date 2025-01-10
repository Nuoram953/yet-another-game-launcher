import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { mainApp, metadataManager, prisma } from "..";
import log from "electron-log/main";
import { IMAGE_TYPE } from "../../common/constant";
import { Game, Prisma } from "@prisma/client";

export async function updateGame(id: string, newData: Partial<Game>) {
  return await prisma.game.update({
    where: { id },
    data: newData,
  });
}

export async function getAllGames() {
  return await prisma.game.findMany({
    include: {
      gameStatus: true,
      storefront: true,
      gameTimePlayed: true,
    },
  });
}

export async function getGameById(
  id: string,
): Promise<
  Prisma.GameGetPayload<{
    include: { gameStatus: true; storefront: true; gameTimePlayed: true };
  }> | null
> {
  return await prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      gameStatus: true,
      storefront: true,
      gameTimePlayed: true,
    },
  });
}

export async function getGameByExtenalIdAndStorefront(
  externalId: number,
  storefront: Storefront,
) {
  return await prisma.game.findFirst({
    where: {
      externalId,
      storefrontId: storefront,
    },
    include: {
      gameStatus: true,
      storefront: true,
      gameTimePlayed: true,
    },
  });
}

export async function createOrUpdateExternal(
  externalId: number,
  data: Game,
  storefront: Storefront,
  gameStatus: GameStatus,
): Promise<Game> {
  const createdOrUpdatedGame = await prisma.game.upsert({
    where: {
      externalId_storefrontId: {
        externalId: externalId,
        storefrontId: storefront,
      },
    },
    update: {
      lastTimePlayed: data.lastTimePlayed,
    },
    create: {
      name: data.name,
      lastTimePlayed: data.lastTimePlayed,
      isInstalled: false,
      gameStatusId: gameStatus,
      storefrontId: storefront,
    },
  });

  const game = await getGameById(createdOrUpdatedGame.id);

  await metadataManager.downloadImage(
    IMAGE_TYPE.COVER,
    game,
    `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${game.externalId}/library_600x900.jpg`,
    "jpg",
  );

  log.info(`${game.name} - ${game.id} - ${game?.storefront?.name} was added`);

  mainApp.sendToRenderer("add-new-game", {
    game,
  });

  return game;
}
