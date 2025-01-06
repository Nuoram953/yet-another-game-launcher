import { Storefront, GameStatus } from "../constant";
import { GameStatus as repo } from "../entities/GameStatus";
import { AppDataSource } from "../data-source";

export async function getGameStatusById(status: GameStatus) {
  return await AppDataSource.getRepository(repo).findOneBy({ id: status });
}
