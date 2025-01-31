import { GameAchievement } from "@prisma/client";
import { prisma } from "..";

export async function findOrCreate(
  gameId: string,
  achievement: Partial<GameAchievement>,
) {
  await prisma.gameAchievement.upsert({
    where: {
      gameId_externalId: {
        gameId: gameId,
        externalId: achievement.externalId!,
      },
    },
    update: {},
    create: {
      gameId: gameId,
      description: achievement.description,
      externalId: achievement.externalId!,
      isHidden: achievement.isHidden,
      name: achievement.name!,
    },
  });
}

export async function setAchievementUnlocked(
  gameId: string,
  achievement: Partial<GameAchievement>,
) {
  await prisma.gameAchievement.update({
    data: {
      isUnlocked: achievement.isUnlocked,
      unlockedAt: new Date().getTime(),
    },
    where: {
      gameId_externalId: {
        gameId: gameId,
        externalId: achievement.externalId!,
      },
    },
  });
}
