import { GameReviewThoughts } from "@prisma/client";
import { prisma } from "..";

export const getByGameId = async (id: string) => {
  return await prisma.gameReviewThoughts.findMany({
    where: {
      gameId: id,
    },
  });
};

export const getById = async (id: string) => {
  return await prisma.gameReviewThoughts.findUnique({
    where: {
      id,
    },
  });
};

export const create = async (gameId: string) => {
  return await prisma.gameReviewThoughts.create({
    data: {
      gameId,
      text: "",
    },
  });
};

export const update = async (id: string, data: Partial<GameReviewThoughts>) => {
  const { updatedAt, createdAt, ...safeData } = data;
  return await prisma.gameReviewThoughts.update({
    data: safeData,
    where: { id },
  });
};

export const deleteById = async (id: string) => {
  return await prisma.gameReviewThoughts.delete({
    where: { id },
  });
};
