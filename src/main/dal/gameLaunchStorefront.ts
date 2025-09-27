import { GameLaunchApp, GameLaunchStorefront } from "@prisma/client";
import { prisma } from "..";

export const createOrUpdate = async (data: Partial<GameLaunchStorefront>): Promise<GameLaunchStorefront> => {
  return await prisma.gameLaunchStorefront.upsert({
    where: {
      gameId_storefrontId: {
        gameId: data.gameId!,
        storefrontId: data.storefrontId!,
      },
    },
    update: {
      name: data.name!,
      isEnabled: data.isEnabled,
    },
    create: {
      name: data.name!,
      gameId: data.gameId!,
      storefrontId: data.storefrontId!,
      externalId: data.externalId!,
      isEnabled: data.isEnabled ?? false,
    },
  });
};

export const getById = async (id: number): Promise<GameLaunchStorefront> => {
  return await prisma.gameLaunchStorefront.findFirst({ where: { id } });
};
