import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { getStorefrontById } from "./storefront";
import { getGameStatusById } from "./game_status";
import { mainApp, metadataManager } from "..";
import { IGame } from "src/common/types";
import log from "electron-log/main";
import { IMAGE_TYPE } from "../../common/constant";

export async function insertMissing(games: IGame[], storefront: Storefront) {
  const store = await getStorefrontById(storefront);
  if (_.isNull(store)) {
    throw new Error("Invalid storefront");
  }

  for (const item of games) {
    let game = await AppDataSource.getRepository(Game).findOneBy({
      storefront: store,
      external_id: item.id,
    });

    if (!game) {
      const status = await getGameStatusById(item.status);
      if (_.isNull(status)) {
        throw new Error("Invalid status");
      }

      game = AppDataSource.getRepository(Game).create({
        storefront: store,
        name: item.name,
        external_id: item.id,
        game_status: status,
        time_played: item.timePlayed,
      });
      await AppDataSource.getRepository(Game).save(game);

      await metadataManager.downloadImage(IMAGE_TYPE.COVER, game, `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${game?.external_id}/library_600x900.jpg`, "jpg")

      log.info(`${game.name} - ${game.id} - ${store.name} was added`);

      mainApp.sendToRenderer("add-new-game", {
        id: game.id,
        name: game.name,
        timePlayed: game.time_played,
        status: game.game_status.name,
      });
    }
  }
}

export async function getAllGames() {
  const games = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .innerJoinAndSelect("game.game_status", "game_status")
    .innerJoinAndSelect("game.storefront", "storefront")
    .getMany();
  return games;
}

export async function getGameById(id: string) {
  const game = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .innerJoinAndSelect("game.game_status", "game_status")
    .innerJoinAndSelect("game.storefront", "storefront")
    .where("id=gameId", { gameId: id })
    .getOne();
  return game;
}
