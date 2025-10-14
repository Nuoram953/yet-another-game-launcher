import * as InternetGameDatabase from "@main/externalApi/internetGameDatabase/service";
import queries from "../dal/dal";

export const search = async (query: string) => {
  return await InternetGameDatabase.searchByName(query, false);
};

export const add = async (externalId: number) => {
  await queries.Wishlist.create(externalId);
};

export const remove = async (externalId: number) => {
  await queries.Wishlist.deleteByExternalId(externalId);
};

export const get = async () => {
  const wishlist = await queries.Wishlist.findAll();

  return await InternetGameDatabase.getByIds(wishlist.map((item) => item.externalId));
};
