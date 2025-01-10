import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { AppDataSource } from "../data-source";
import { getStorefrontById } from "./storefront";
import { mainApp, metadataManager, prisma } from "..";
import log from "electron-log/main";
import { IMAGE_TYPE } from "../../common/constant";
import { Game } from "@prisma/client";

export async function updateGame(id: string, newData: Partial<Game>) {
  return await prisma.game.update({
    where: { id },
    data: newData,
  });
}

export async function getAllGames() {
  return await prisma.game.findMany({
    include: {
      game_status: true,
      Storefront: true,
      GameTimePlayed: true,
    },
  });
}

export async function getGameById(id: string) {
  return await prisma.game.findFirst({
    where: {
      id,
    },
    include: {
      game_status: true,
      Storefront: true,
      GameTimePlayed: true,
    },
  });
}

export async function getGameByExtenalIdAndStorefront(
  externalId: number,
  storefront: Storefront,
) {
  const game = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .innerJoinAndSelect("game.game_status", "game_status")
    .innerJoinAndSelect("game.storefront", "storefront")
    .where("game.external_id=:externalId and game.storefront=:storefrontId", {
      externalId: externalId,
      storefrontId: storefront,
    })
    .getOne();
  return game;
}

export async function isGameExist(externalId: number, storefront: Storefront) {
  const store = await getStorefrontById(storefront);
  const game = await AppDataSource.getRepository(Game).findOne({
    where: { external_id: externalId, storefront: store! },
  });
  return game;
}

export async function createOrUpdate(
  game: Game,
  storefront: Storefront,
): Promise<Game> {
  let dbGame = await getGameByExtenalIdAndStorefront(
    game.external_id,
    storefront,
  );

  if (!(await isGameExist(game.external_id, storefront)) && !dbGame) {
    dbGame = AppDataSource.getRepository(Game).create(game);

    await AppDataSource.getRepository(Game).save(game);

    await metadataManager.downloadImage(
      IMAGE_TYPE.COVER,
      game,
      `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${dbGame.external_id}/library_600x900.jpg`,
      "jpg",
    );

    log.info(
      `${dbGame.name} - ${dbGame.id} - ${dbGame.storefront.name} was added`,
    );

    mainApp.sendToRenderer("add-new-game", {
      id: dbGame.id,
      name: dbGame.name,
      timePlayed: dbGame.game_time_played_id.time_played,
      status: dbGame.game_status.name,
    });
    return dbGame;
  }

  await updateGame(game);

  return dbGame!;
}
