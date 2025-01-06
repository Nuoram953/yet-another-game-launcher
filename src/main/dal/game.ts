import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { IGame } from "../types";
import { getStorefrontById } from "./storefront";

export async function insertMissing(games: IGame[], storefront:Storefront) {
  const store = await getStorefrontById(storefront) 
  if (_.isNull(store)){
    return
  }

  const bulkData = games.map(game=>({
    storefront:store,
    external_id:game.id,
    game_status:GameStatus.UNPLAYED,
    time_played:game.timePlayed
  }))
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Game)
    .values(bulkData)
    .execute();
}

export async function getAllGames() {
  return await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .getMany();
}
