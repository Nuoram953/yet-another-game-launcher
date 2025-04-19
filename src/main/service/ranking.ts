import { RankingGame } from "@prisma/client";
import queries from "../dal/dal";

export const getRanking = async (id: number) => {
  if (!id) {
    throw new Error("Ranking id is required");
  }
  return await queries.Ranking.findById(id);
};

export const getAll = async () => {
  return await queries.Ranking.findAll();
};

export const create = async (name: string, maxItems: number) => {
  const ranking = await queries.Ranking.insert(name, maxItems);
  if (!ranking) {
    throw new Error("Error creating ranking");
  }
  return await queries.Ranking.findById(ranking.id);
};

export const destroy = async (id: number) => {
  const ranking = await queries.Ranking.destroy(id);
  if (!ranking) {
    throw new Error("Error creating ranking");
  }
};

export const edit = async (data: Partial<RankingGame>) => {
  await queries.RankingGame.edit(data);
};

export const removeGameFromRanking = async (rankingId: number, gameId:string) => {
  await queries.RankingGame.destroy(rankingId, gameId);
};
