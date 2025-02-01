import { Game } from "@prisma/client";
import queries from "../dal/dal";
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import log from "electron-log/main";
import SteamGridDB from "../api/metadata/steamgriddb";
import Steam from "../api/storefront/steam";
import { GameWithRelations } from "../dal/game";
import _ from "lodash";

export const updateAchievements = async (game: GameWithRelations) => {
  const countAchievements = game.achievements.length;
  const countAchievementPictures =
    await metadataManager.getCountAchievementPictures(game);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      const storeSteam = new Steam();
      if (!countAchievements || countAchievementPictures != countAchievements) {
        await storeSteam.getAchievementsForGame(game);
      }
      await storeSteam.getUserAchievementsForGame(game);
    }
  }
};

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

export const postLaunch = async (game: GameWithRelations) => {
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

  await updateAchievements(game);

  mainApp.sendToRenderer("is-game-running", {
    isRunning: false,
  });

  await refreshLibrary(game.id)
};

export const downloadAchievements = () => {};

export const refreshLibrary = async (gameId?:string) => {
  if (!_.isUndefined(gameId)) {
    mainApp.sendToRenderer("request:game", {
      ...(await queries.Game.getGameById(gameId)),
    });
  }

  mainApp.sendToRenderer("request:games", {});
};
