import { GameReview } from "@prisma/client";
import { prisma } from "..";

export const createOrUpdate = async (data: Partial<GameReview>) => {
  return await prisma.gameReview.upsert({
    where: {
      gameId: data.gameId,
    },
    update: {
      gameId: data.gameId!,
      score: data.score,
      isAdvanceReview: false,
      review: data.review,
    },
    create: {
      gameId: data.gameId!,
      score: data.score!,
      isAdvanceReview: false,
      review: data.review,
    },
  });
};

export const deleteByGameId = async (gameId: string) => {
  await prisma.gameReview.deleteMany({
    where: {
      gameId: gameId,
    },
  });
};

export const getByGameId = async (id: string) => {
  return await prisma.gameReview.findUnique({
    where: {
      gameId: id,
    },
  });
};
