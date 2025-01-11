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
    },
    orderBy: [{ lastTimePlayed: "desc" }],
  });
}

export async function getGameById(id: string): Promise<Prisma.GameGetPayload<{
  include: { gameStatus: true; storefront: true };
}> | null> {
  return await prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      gameStatus: true,
      storefront: true,
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
    },
  });
}

export async function createOrUpdateExternal(
  data: Partial<Game>,
  storefront: Storefront,
): Promise<Prisma.GameGetPayload<{
  include: { gameStatus: true; storefront: true };
}> | null> {
  const createdOrUpdatedGame = await prisma.game.upsert({
    where: {
      externalId_storefrontId: {
        externalId: data.externalId!,
        storefrontId: storefront,
      },
    },
    update: {
      lastTimePlayed: data.lastTimePlayed,
      gameStatusId: data.gameStatusId,
      timePlayed: data.timePlayed,
    },
    create: {
      name: data.name!,
      lastTimePlayed: data.lastTimePlayed,
      isInstalled: false,
      gameStatusId: data.gameStatusId ?? GameStatus.UNPLAYED,
      storefrontId: storefront,
      externalId: data.externalId!,
      timePlayed: data.timePlayed,
    },
  });

  return await getGameById(createdOrUpdatedGame.id);
}
