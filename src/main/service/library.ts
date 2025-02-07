import _ from "lodash";
import queries from "../dal/dal"
import { metadataManager } from "../index";
import { updateAchievements } from "./game";
import { FilterConfig, SortConfig } from "../../common/types";

export const getCountForAllStatus = async () => {
  return await queries.GameStatus.getCountForAllStatus()
};

export const getCountForAllStore = async () => {
  return await queries.Game.getCountByStore()
};

export const getStatus = async () => {
  return await queries.GameStatus.getAll()
};

export const getGame = async (id:string) => {
  let game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
  }

  // await metadataManager.downloadMissing(game)
  await updateAchievements(game)

  return await queries.Game.getGameById(id);
};

export const getGames = async (filters?:FilterConfig, sort?:SortConfig) => {
  return await queries.Game.getGames(null, filters, sort);
};
