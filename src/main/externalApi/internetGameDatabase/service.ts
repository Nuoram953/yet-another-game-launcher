import * as InternetGameDatabaseEndpoints from "./endpoints";

export const getById = async (id: number) => {
  return await InternetGameDatabaseEndpoints.getById(id);
};

export const getByIds = async (ids: number[]) => {
  return await InternetGameDatabaseEndpoints.getByIds(ids);
};

export const searchByName = async (name: string, onlyParentGame: boolean = true) => {
  const results = await InternetGameDatabaseEndpoints.search(name, onlyParentGame);
  return results;
};
