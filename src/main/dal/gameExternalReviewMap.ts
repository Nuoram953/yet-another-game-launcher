import { prisma } from "..";

export const create = async (gameId: string, externalReviewId: number) => {
  await prisma.gameExternalReviewMap.create({
    data: {
      gameId: gameId,
      externalReviewId: externalReviewId,
    },
  });
};

export const getAllByGameId = async (gameId: string) => {
  return await prisma.gameExternalReviewMap.findMany({
    where: {
      gameId: gameId,
    },
    include: {
      externalReview: true,
    },
  });
};

export const deleteByGameId = async (gameId: string) => {
  const gameExternalReviewMap = await getAllByGameId(gameId);

  for (const map of gameExternalReviewMap) {
    await prisma.gameExternalReviewMap.delete({
      where: { id: map.id },
    });

    await prisma.externalReview.delete({
      where: { id: map.externalReview.id },
    });
  }
};
