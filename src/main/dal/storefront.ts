import { Storefront } from "../constant";
import { Storefront as repo } from "../entities/Storefront";
import { AppDataSource } from "../data-source";

export async function getStorefrontById(storefront: Storefront) {
  await AppDataSource.initialize()
  return await AppDataSource.getRepository(repo).findOneBy({id:1});
}
