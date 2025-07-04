import _ from "lodash";
import { GameStatus, Storefront } from "../../common/constant";
import { prisma } from "..";
import { Game, Prisma } from "@prisma/client";
import queries from "./dal";
import { FilterConfig, GameWithRelations, SortConfig } from "../../common/types";
import { sanitizeGameName } from "../utils/utils";
import {
  buildDateAddedWhereClause,
  buildLastTimePlayedWhereClause,
  buildMainStoryWhereClause,
  buildTimePlayedWhereClause,
} from "./utils";

const include = {
  gameStatus: true,
  storefront: true,
  achievements: true,
  activities: true,
  developers: { include: { company: true } },
  publishers: { include: { company: true } },
  tags: { include: { tag: true } },
  review: true,
  gamescope: true,
  downloadHistory: true,
  statusHistory: { include: { gameStatus: true } },
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

export async function getGames(limit?: number | null, filters?: FilterConfig, sort?: SortConfig) {
  const where: any = filters
    ? {
        developers: !_.isNil(filters.developpers)
          ? {
              some: {
                companyId: {
                  in: filters.developpers.map((developer) => developer.value),
                },
              },
            }
          : undefined,

        publishers: !_.isNil(filters.publishers)
          ? {
              some: {
                companyId: {
                  in: filters.publishers.map((publisher) => publisher.value),
                },
              },
            }
          : undefined,

        tags: !_.isNil(filters.tags)
          ? {
              some: {
                tagId: {
                  in: filters.tags.map((tag) => tag.value),
                },
              },
            }
          : undefined,

        gameStatusId: !_.isNil(filters.status)
          ? {
              in: filters.status.map((status) => Number(status.value)),
            }
          : undefined,

        isInstalled:
          !_.isNil(filters.isInstalled) && filters.isInstalled
            ? filters.isInstalled === "indeterminate"
              ? false
              : true
            : undefined,

        isFavorite:
          !_.isNil(filters.isFavorite) && filters.isFavorite
            ? filters.isFavorite === "indeterminate"
              ? false
              : true
            : undefined,

        storefrontId: !_.isNil(filters.storefronts)
          ? {
              in: filters.storefronts.map((store) => Number(store.value)),
            }
          : undefined,
      }
    : undefined;

  if (!_.isNil(filters.timePlayed)) {
    where.OR = [...(where?.OR || []), ...buildTimePlayedWhereClause(filters.timePlayed)];
  }

  if (!_.isNil(filters.mainStory)) {
    where.OR = [...(where?.OR || []), ...buildMainStoryWhereClause(filters.mainStory)];
  }

  if (!_.isNil(filters.dateAdded)) {
    where.OR = [...(where?.OR || []), ...buildDateAddedWhereClause(filters.dateAdded)];
  }

  if (!_.isNil(filters.lastTimePlayed)) {
    where.OR = [...(where?.OR || []), ...buildLastTimePlayedWhereClause(filters.lastTimePlayed)];
  }

  const games = await prisma.game.findMany({
    where,
    include,
    orderBy: sort ? { [sort.field]: sort.direction } : [{ lastTimePlayed: "desc" }],
    ...(limit && { take: limit }),
  });

  return games;
}

export async function getGameById(id: string): Promise<GameWithRelations | null> {
  return prisma.game.findFirst({
    where: { id },
    include,
  });
}

export async function getGameByExtenalIdAndStorefront(
  externalId: string,
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
  externalId: string,
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
      lastTimePlayed: parseInt((new Date().getTime() / 1000).toFixed(0)),
    },
    where: {
      id: gameId,
    },
  });
}

export async function updateIsInstalled(installedExternalIds: string[], storefront: Storefront, isInstalled: boolean) {
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
): Promise<GameWithRelations | null> {
  const createdOrUpdatedGame = await prisma.game.upsert({
    where: {
      externalId_storefrontId: {
        externalId: data.externalId!,
        storefrontId: storefront,
      },
    },
    update: {
      lastTimePlayed: data?.lastTimePlayed,
      timePlayed: data.timePlayed,
      timePlayedLinux: data.timePlayedLinux,
      timePlayedWindows: data.timePlayedWindows,
      timePlayedMac: data.timePlayedMac,
      timePlayedSteamdeck: data.timePlayedSteamdeck,
      size: data.size,
      location: data.location,
      isInstalled: data.isInstalled,
    },
    create: {
      name: sanitizeGameName(data.name!),
      lastTimePlayed: data?.lastTimePlayed,
      isInstalled: false,
      gameStatusId: data.gameStatusId ?? GameStatus.UNPLAYED,
      storefrontId: storefront,
      externalId: data.externalId!,
      timePlayed: data.timePlayed,
      timePlayedLinux: data.timePlayedLinux,
      timePlayedWindows: data.timePlayedWindows,
      timePlayedMac: data.timePlayedMac,
      timePlayedSteamdeck: data.timePlayedSteamdeck,
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

export async function getCountByStatusId(statusId: number) {
  return await prisma.game.count({
    where: { gameStatusId: statusId },
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

export async function getCountByStoreId(storefrontId: number) {
  return await prisma.game.count({
    where: { storefrontId },
  });
}

export async function getGamesLastPlayed(limit?: number) {
  return await prisma.game.findMany({
    include,
    orderBy: [{ lastTimePlayed: "desc" }],
    ...(limit && { take: limit }),
  });
}
