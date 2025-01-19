import { Game } from "@prisma/client";
import * as GameQueries from "../dal/game";
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import log  from "electron-log/main";

export const createOrUpdateGame = async (
  data: Partial<Game>,
  store: Storefront,
) => {
  const game = await GameQueries.createOrUpdateExternal(data, store);

  if (!game) {
    throw new Error("invalid game");
  }

  await metadataManager.downloadMissingImages(game);
  //if(game.updatedAt.getTime() === game.createdAt.getTime()){
  //  log.info(`${game.name} - ${game.id} - ${game?.storefront?.name} was added`);
  //  await metadataManager.downloadImage(
  //    IMAGE_TYPE.COVER,
  //    game,
  //    `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${game.externalId}/library_600x900.jpg`,
  //    "jpg",
  //  );
  //}
  //download 1 cover, logo, and background
  //download achievements
  //download music

  mainApp.sendToRenderer("add-new-game", {
    ...game,
  });
};
export const preLaunch = async (game: Game) => {
  log.info(`Starting game ${game.id}`);

  mainApp.sendToRenderer("is-game-running", {
    isRunning: true,
    game
  });
};

export const postLaunch = async (game: Game) => {
  const { startTime, endTime } = await monitorDirectoryProcesses(
    game?.location!,
  );

  if (startTime && endTime) {
    await createGameActiviy(game.id, startTime, endTime);
    await GameQueries.updateTimePlayed(
      game.id,
      (await getMinutesBetween(startTime, endTime)) + 1,
    ); //The minute delay for the catching the process
  }

  mainApp.sendToRenderer("is-game-running", {
    isRunning: false,
  });

  mainApp.sendToRenderer("request:games",{});
};

export const downloadAchievements = () => {};
