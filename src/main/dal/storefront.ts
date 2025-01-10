import { Storefront } from "../entities/Storefront";
import { AppDataSource } from "../data-source";

export async function getStorefrontById(storefront: number):Promise<Storefront|null> {
  return await AppDataSource.getRepository(Storefront).findOneBy({id:1});
}
