import { GameLaunchApp, GameLaunchEmulation } from "@prisma/client";
import { prisma } from "..";

export const createOrUpdate = async (data: Partial<GameLaunchEmulation>): Promise<GameLaunchEmulation> => {
  if (data.id) {
    return await prisma.gameLaunchEmulation.upsert({
      where: {
        id: data.id,
      },
      update: {
        name: data.name,
        path: data.path,
        isEnabled: data.isEnabled,
        retroAchievementsId: data.retroAchievementsId,
      },
      create: {
        name: data.name!,
        gameId: data.gameId!,
        emulatorId: data.emulatorId,
        retroAchievementsId: data.retroAchievementsId,
        isEnabled: data.isEnabled ?? true,
        path: data.path,
      },
    });
  } else {
    return await prisma.gameLaunchEmulation.create({
      data: {
        name: data.name!,
        gameId: data.gameId!,
        emulatorId: data.emulatorId,
        retroAchievementsId: data.retroAchievementsId,
        isEnabled: data.isEnabled ?? true,
        path: data.path,
      },
    });
  }
};

export const getById = async (id: number): Promise<GameLaunchApp> => {
  return await prisma.gameLaunchEmulation.findFirst({ where: { id } });
};

export const deleteById = async (id: number): Promise<void> => {
  await prisma.gameLaunchEmulation.delete({ where: { id } });
};
