import { orderBy } from "lodash";
import { prisma } from "..";

export async function create(gameId: string) {
  await prisma.downloadHistory.create({
    data: {
      gameId: gameId,
      createdAt: new Date().getTime(),
    },
  });
}

export async function getAll(limit?: number) {
  return await prisma.downloadHistory.findMany({
    ...(limit && { take: limit, orderBy: { createdAt: "desc" } }),
  });
}
