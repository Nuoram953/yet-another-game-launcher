import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { mainApp, metadataManager, prisma } from "..";
import log from "electron-log/main";
import { IMAGE_TYPE } from "../../common/constant";
import { Game, Prisma } from "@prisma/client";

export type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    gameStatus: true;
    storefront: true;
    achievements: true;
    activities: true;
    developers: { include: { company: true } };
    publishers: { include: { company: true } };
    tags: { include: { tag: true } };
  };
}>;

export async function updateGame(id: string, newData: Partial<Game>) {
  return await prisma.game.update({
    where: { id },
    data: newData,
  });
}

export async function getAllGames(limit?: number) {
  const where = {
    include: {
      gameStatus: true,
      storefront: true,
    },
    orderBy: [{ lastTimePlayed: "desc" as Prisma.SortOrder }],
    ...(limit && { take: limit }),
  };
  return await prisma.game.findMany(where);
}

export async function getGameById(id: string) {
  return prisma.game.findFirst({
    where: { id },
    include: {
      gameStatus: true,
      storefront: true,
      achievements: true,
      activities: true,
      developers: { include: { company: true } },
      publishers: { include: { company: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getGameByExtenalIdAndStorefront(
  externalId: number,
  storefront: Storefront,
):Promise<GameWithRelations | null> {
  return await prisma.game.findFirst({
    where: {
      externalId,
      storefrontId: storefront,
    },
    include: {
      gameStatus: true,
      storefront: true,
      achievements: true,
      activities: true,
      developers: { include: { company: true } },
      publishers: { include: { company: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function updateSizeAndLocation(
  externalId: number,
  storefront: Storefront,
  size: number,
  location: string,
) {
  await prisma.game.updateMany({
    data: {
      size,
      location,
    },
    where: {
      externalId: externalId,
      storefrontId: storefront,
    },
  });
}

export async function updateTimePlayed(gameId: string, timePlayed: number) {
  await prisma.game.update({
    data: {
      timePlayed: {
        increment: timePlayed,
      },
      lastTimePlayed: new Date().getTime(),
    },
    where: {
      id: gameId,
    },
  });
}

export async function updateIsInstalled(
  installedExternalIds: number[],
  storefront: Storefront,
  isInstalled: boolean,
) {
  await prisma.game.updateMany({
    data: {
      isInstalled: isInstalled,
    },
    where: {
      externalId: { in: installedExternalIds },
      storefrontId: storefront,
    },
  });

  await prisma.game.updateMany({
    data: {
      isInstalled: false,
    },
    where: {
      externalId: { notIn: installedExternalIds },
      storefrontId: storefront,
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

export async function getCountByStatus() {
  return await prisma.game.groupBy({
    by: ["gameStatusId"],
    _count: {
      gameStatusId: true,
    },
  });
}
