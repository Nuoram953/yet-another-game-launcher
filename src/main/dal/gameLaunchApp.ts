import { GameLaunchApp } from "@prisma/client";
import { prisma } from "..";

export const createOrUpdate = async (data: Partial<GameLaunchApp>): Promise<GameLaunchApp> => {
  if (data.id) {
    return await prisma.gameLaunchApp.upsert({
      where: {
        id: data.id,
      },
      update: {
        name: data.name,
        path: data.path,
        isEnabled: data.isEnabled,
      },
      create: {
        name: data.name!,
        gameId: data.gameId!,
        isEnabled: data.isEnabled ?? true,
        path: data.path,
      },
    });
  } else {
    return await prisma.gameLaunchApp.create({
      data: {
        name: data.name!,
        gameId: data.gameId!,
        isEnabled: data.isEnabled ?? true,
        path: data.path,
      },
    });
  }
};

export const getById = async (id: number): Promise<GameLaunchApp> => {
  return await prisma.gameLaunchApp.findFirst({ where: { id } });
};

export const deleteById = async (id: number): Promise<void> => {
  await prisma.gameLaunchApp.delete({ where: { id } });
};
