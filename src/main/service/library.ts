import queries from "../dal/dal"

export const getCountForAllStatus = async () => {
  return await queries.GameStatus.getCountForAllStatus()
};

export const getCountForAllStore = async () => {
  return await queries.Game.getCountByStore()
};
