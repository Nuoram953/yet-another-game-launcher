import queries from "../dal/dal"

export const getCountForAllStatus = async () => {
  return await queries.GameStatus.getCountForAllStatus()
};
