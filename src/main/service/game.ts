import { Game } from "@prisma/client";
import queries from "../dal/dal"
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import log from "electron-log/main";
import SteamGridDB from "../api/metadata/steamgriddb";
import Steam from "../api/storefront/steam";

export const createOrUpdateGame = async (
  data: Partial<Game>,
  store: Storefront,
) => {
  const game = await queries.Game.createOrUpdateExternal(data, store);

  if (!game) {
    throw new Error("invalid game");
  }

  if (game.updatedAt.getTime() === game.createdAt.getTime()) {
    const sgdb = new SteamGridDB(game);
    await sgdb.getGameIdByExternalId("steam");
    await sgdb.downloadAllImageType(3, 3);
  }

  switch(store){
    case Storefront.STEAM:{
      const storeSteam = new Steam()
      await storeSteam.getAchievementsForGame(game)
      await storeSteam.getAchievementsForGame(game)
    }
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
    const minutes = await getMinutesBetween(startTime, endTime);
    if (minutes > 0) {
      await createGameActiviy(game.id, startTime, endTime);
      await queries.Game.updateTimePlayed(game.id, minutes + 1);
    } else {
      log.warn(
        `Game session for ${game.id} was ${minutes} minutes. Won't create a game activity`,
      );
    }
  }

  mainApp.sendToRenderer("is-game-running", {
    isRunning: false,
  });

  mainApp.sendToRenderer("request:games", {});

  mainApp.sendToRenderer("request:game", {
    ...await queries.Game.getGameById(game.id)
  });


};

export const downloadAchievements = () => {};
