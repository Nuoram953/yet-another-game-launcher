import { Ranking } from "@prisma/client";
import * as RankingService from "../ranking/ranking.service";
import * as RankingSchema from "../ranking/ranking.schema";
import { ErrorMessage } from "@common/error";

export const getRankings = async () => {
  return await RankingService.getRankings();
};

export const getRanking = async (id: number) => {
  const result = await RankingSchema.GetRankingSchema.safeParseAsync(id);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const ranking = await RankingService.getRanking(id);

  if (!ranking) throw new Error(ErrorMessage.NOT_FOUND);

  return ranking;
};

export const createRanking = async (data: Partial<Ranking>) => {
  const result = await RankingSchema.CreateRankingSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await RankingService.createRanking(result.data);
};

export const deleteRanking = async (id: number) => {
  const result = await RankingSchema.DeleteRankingSchema.safeParseAsync(id);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await RankingService.deleteRanking(id);
};

export const addGameToRanking = async (data: RankingSchema.AddGameRankingSchema) => {
  const result = await RankingSchema.AddGameRankingSchema.safeParseAsync({
    rankingId: data.rankingId,
    gameId: data.gameId,
  });

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await RankingService.addGameRanking(result.data);
};

export const removeGameFromRanking = async (data: RankingSchema.RemoveGameRankingSchema) => {
  const result = await RankingSchema.RemoveGameRankingSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await RankingService.removeGameRanking(result.data);
};

export const updateGameOrder = async (data: RankingSchema.UpdateGameOrderSchema) => {
  const result = await RankingSchema.UpdateGameOrderSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await RankingService.updateGameOrder(result.data);
};
