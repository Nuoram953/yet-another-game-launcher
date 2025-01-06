import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { IGame } from "../types";
import { getStorefrontById } from "./storefront";
import { getGameStatusById } from "./game_status";

export async function insertMissing(games: IGame[], storefront: Storefront) {
  const store = await getStorefrontById(storefront);
  if (_.isNull(store)) {
    throw new Error("Invalid storefront")
  }

  const status = await getGameStatusById(GameStatus.UNPLAYED);
  if (_.isNull(status)) {
    throw new Error("Invalid status")
  }

  const bulkData = games.map((game) => ({
    storefront: store,
    name: game.name,
    external_id: game.id,
    game_status: status,
    time_played: game.timePlayed,
  }));

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Game)
    .values(bulkData)
    .orIgnore()
    .execute();
}

export async function getAllGames() {
  const games = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .getMany();
  console.log(games)
  return games
}
