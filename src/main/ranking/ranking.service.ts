import { MEDIA_TYPE } from "@common/constant";
import queries from "../dal/dal";

import * as RankingSchema from "../ranking/ranking.schema";

import * as MediaService from "../media/media.service";
import dayjs from "dayjs";
import { ErrorMessage } from "@common/error";

export const getRankings = async () => {
  const rankings = await queries.Ranking.findAll();

  return Promise.all(
    rankings.map(async (ranking) => ({
      id: ranking.id,
      name: ranking.name,
      description: ranking.description,
      creationDate: dayjs(ranking.createdAt).format("MMMM D, YYYY"),
      tags: ranking.tags.map((tag) => tag.rankingTag.name),
      games: await Promise.all(
        ranking.games.map(async (game) => ({
          id: game.gameId,
          name: game.game.name,
          cover: await MediaService.getMediaByType(MEDIA_TYPE.COVER, game.gameId, 1),
        })),
      ),
    })),
  );
};

export const getRanking = async (id: number) => {
  const ranking = await queries.Ranking.findUnique(id);

  if (!ranking) throw new Error(ErrorMessage.NOT_FOUND);

  return {
    id: ranking.id,
    name: ranking.name,
    description: ranking.description,
    creationDate: dayjs(ranking.createdAt).format("MMMM D, YYYY"),
    tags: ranking.tags.map((tag) => tag.rankingTag.name),
    games: await Promise.all(
      ranking.games.map(async (game) => ({
        id: game.gameId,
        name: game.game.name,
        cover: await MediaService.getMediaByType(MEDIA_TYPE.COVER, game.gameId, 1),
      })),
    ),
  };
};

export const createRanking = async (data: RankingSchema.CreateRankingSchema) => {
  return await queries.Ranking.create(data.name, data.description);
};

export const deleteRanking = async (id: number) => {
  await queries.Ranking.deleteById(id);
};

export const addGameRanking = async (data: RankingSchema.AddGameRankingSchema) => {
  const ranking = await queries.Ranking.findUnique(data.rankingId);
  if (!ranking) throw new Error(ErrorMessage.NOT_FOUND);

  const game = await queries.Game.getGameById(data.gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  // Use prisma transaction to ensure atomic rank calculation
  const { prisma } = await import("../index");

  return await prisma.$transaction(async (tx) => {
    // Get the current max rank for this ranking
    const maxRank = await tx.rankingGame.aggregate({
      where: { rankingId: data.rankingId },
      _max: { rank: true },
    });

    const nextRank = (maxRank._max.rank || 0) + 1;

    return await tx.rankingGame.upsert({
      where: {
        rankingId_gameId: {
          rankingId: data.rankingId,
          gameId: data.gameId,
        },
      },
      update: {
        rank: nextRank,
        updatedAt: new Date(),
      },
      create: {
        rank: nextRank,
        gameId: data.gameId,
        rankingId: data.rankingId,
        createdAt: new Date(),
      },
    });
  });
};

export const removeGameRanking = async (data: RankingSchema.RemoveGameRankingSchema) => {
  const ranking = await queries.Ranking.findUnique(data.rankingId);
  if (!ranking) throw new Error(ErrorMessage.NOT_FOUND);

  const game = await queries.Game.getGameById(data.gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  return await queries.RankingGame.destroy(data.rankingId, data.gameId);
};

export const updateGameOrder = async (data: RankingSchema.UpdateGameOrderSchema) => {
  const ranking = await queries.Ranking.findUnique(data.rankingId);
  if (!ranking) throw new Error(ErrorMessage.NOT_FOUND);

  const updatePromises = data.gameOrders.map((gameOrder) =>
    queries.RankingGame.upsert({
      rankingId: data.rankingId,
      gameId: gameOrder.gameId,
      rank: gameOrder.rank,
    }),
  );

  return await Promise.all(updatePromises);
};
