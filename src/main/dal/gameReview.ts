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
      isAdvanceReview: data.isAdvanceReview,
      scoreGraphic: data.scoreGraphic,
      scoreGameplay: data.scoreGameplay,
      scoreContent: data.scoreContent,
      scoreStory: data.scoreStory,
      scoreSound: data.scoreSound,
      review: data.review,
    },
    create: {
      gameId: data.gameId!,
      score: data.score!,
      isAdvanceReview: data.isAdvanceReview,
      scoreGraphic: data.scoreGraphic,
      scoreGameplay: data.scoreGameplay,
      scoreContent: data.scoreContent,
      scoreStory: data.scoreStory,
      scoreSound: data.scoreSound,
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
