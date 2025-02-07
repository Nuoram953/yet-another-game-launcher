import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { prisma } from "..";
import { Game, Prisma } from "@prisma/client";
import queries from "./dal";
import { GameWithRelations } from "../../common/types";

const include = {
  gameStatus: true,
  storefront: true,
  achievements: true,
  activities: true,
  developers: { include: { company: true } },
  publishers: { include: { company: true } },
  tags: { include: { tag: true } },
  review: true,
};

export async function update(id: string, newData: Partial<Game>) {
  if (newData.hasOwnProperty("gameStatusId")) {
    await queries.GameStatusHistory.create(id, newData.gameStatusId!);
  }

  return await prisma.game.update({
    where: { id },
    data: newData,
  });
}

export async function getGames(
  limit?: number | null,
  filters?: Record<string, any>,
  sort?: Record<string, Prisma.SortOrder>,
) {
  const where = filters
    ? Object.fromEntries(
        Object.entries(filters.filters).filter(([_, value]) => value !== null),
      )
    : undefined;

  return await prisma.game.findMany({
    where,
    include,
    orderBy: sort
      ? Object.entries(sort).map(([key, value]) => ({ [key]: value }))
      : [{ lastTimePlayed: "desc" }],
    ...(limit && { take: limit }),
  });
}

export async function getGameById(
  id: string,
): Promise<GameWithRelations | null> {
  return prisma.game.findFirst({
    where: { id },
    include,
  });
}

export async function getGameByExtenalIdAndStorefront(
  externalId: number,
  storefront: Storefront,
): Promise<GameWithRelations | null> {
  return await prisma.game.findFirst({
    where: {
      externalId,
      storefrontId: storefront,
    },
    include,
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

export async function getCountByStore() {
  return await prisma.game.groupBy({
    by: ["storefrontId"],
    _count: {
      storefrontId: true,
    },
  });
}
