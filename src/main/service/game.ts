import { Game } from "@prisma/client";
import * as GameQueries from "../dal/game";
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import log from "electron-log/main";
import SteamGridDB from "../api/metadata/steamgriddb";

export const createOrUpdateGame = async (
  data: Partial<Game>,
  store: Storefront,
) => {
  const game = await GameQueries.createOrUpdateExternal(data, store);

  if (!game) {
    throw new Error("invalid game");
  }

  if (game.updatedAt.getTime() === game.createdAt.getTime()) {
    const sgdb = new SteamGridDB(game);
    await sgdb.getGameIdByExternalId("steam");
    await sgdb.downloadAllImageType(3, 3);
  }

  mainApp.sendToRenderer("add-new-game", {
    ...game,
  });
};
export const preLaunch = async (game: Game) => {
  log.info(`Starting game ${game.id}`);

  mainApp.sendToRenderer("is-game-running", {
    isRunning: true,
    game,
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

  mainApp.sendToRenderer("request:games", {});
};

export const downloadAchievements = () => {};
