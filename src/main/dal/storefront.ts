import { Storefront } from "../constant";
import { Storefront as repo } from "../entities/Storefront";
import { AppDataSource } from "../data-source";

export async function getStorefrontById(storefront: Storefront) {
  return AppDataSource.getRepository(repo).findOneBy({ id: storefront });
}