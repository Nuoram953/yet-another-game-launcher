import { prisma } from "..";
import queries from "./dal";

export async function findOrCreate(gameId: string, name: string) {
  const platform = await queries.Platform.findOrCreate(name);

  await prisma.gamePlatform.upsert({
    where: {
      gameId_platformId: {
        gameId: gameId,
        platformId: platform.id,
      },
    },
    update: {},
    create: {
      gameId: gameId,
      platformId: platform.id,
    },
  });
}

export async function getAll() {
  return await prisma.gamePlatform.findMany({ include: { platform: true } });
}

export async function getCountByPlatformId(platformId: number) {
  return await prisma.gamePlatform.count({
    where: { platformId: platformId },
  });
}
