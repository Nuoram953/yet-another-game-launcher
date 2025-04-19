import { RankingGame } from "@prisma/client";
import { prisma } from "..";

export async function edit(data: Partial<RankingGame>) {
  return await prisma.rankingGame.upsert({
    where: {
      rankingId_gameId: {
        rankingId: data.rankingId!,
        gameId: data.gameId!,
      },
    },
    update: {
      rank: data.rank ?? null,
      updatedAt: new Date(),
    },
    create: {
      rank: data.rank ?? null,
      gameId: data.gameId!,
      rankingId: data.rankingId!,
      createdAt: new Date(),
    },
  });
}

export async function destroy(rankingId: number, gameId: string) {
  return await prisma.rankingGame.delete({
    where: { rankingId_gameId: { rankingId, gameId } },
  });
}
