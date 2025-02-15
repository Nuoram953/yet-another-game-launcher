import { Game, GameConfigGamescope, GameReview } from "@prisma/client";
import queries from "../dal/dal";
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import {
  killDirectoyProcess,
  monitorDirectoryProcesses,
} from "../utils/tracking";
import { delay, getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import log from "electron-log/main";
import SteamGridDB from "../api/metadata/steamgriddb";
import Steam from "../api/storefront/steam";
import _ from "lodash";
import { GameWithRelations } from "../../common/types";
import dataManager from "../manager/dataChannelManager";
import { DataRoute } from "../../common/constant";
import { createDownloadTracker } from "../storefront/steam/monitor";
import * as SteamCommand from "../storefront/steam/commands";
import { spawn } from "child_process";
import { setGameLaunchOptions } from "../storefront/steam/utils";

export const preLaunch = async (game: GameWithRelations) => {
  log.info(`preLaunch for game ${game.id}`);
};

export const launch = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }
  await preLaunch(game);
  log.info(`Launching game ${game.id}`);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamCommand.run(game)
      break
      // spawn("steam", ["-silent", `steam://launch/${game.externalId}`], {
      //   detached: true,
      //   stdio: "ignore",
      // });
    }
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: true,
    id: game.id,
  });

  const { startTime, endTime } = await monitorDirectoryProcesses(
    game?.location!,
  );
  await postLaunch(game, startTime, endTime);
};

export const install = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      SteamCommand.install(game.externalId!);
      await delay(10000);
      createDownloadTracker(game);
    }
  }
};

export const uninstall = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      SteamCommand.uninstall(game.externalId!);
    }
  }

  await queries.Game.update(game.id, { isInstalled: false });
  await refreshGame(game.id);
};

export const kill = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }

  await killDirectoyProcess(game.location!);

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });
};

export const postLaunch = async (
  game: GameWithRelations,
  startTime: Date,
  endTime: Date | null,
) => {
  log.info(`postLaunch for game ${game.id}`);
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

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });

  await refreshGame(game.id);
};

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

export const downloadAchievements = () => {};

export const refreshGame = async (gameId: string) => {
  dataManager.send(DataRoute.REQUEST_GAME, {
    ...(await queries.Game.getGameById(gameId)),
  });
};

export const refreshLibrary = async () => {
  dataManager.send("request:games", {});
};

export const setReview = async (data: Partial<GameReview>) => {
  if (_.isUndefined(data.gameId)) {
    throw new Error("No game Id found");
  }

  const game = queries.Game.getGameById(data.gameId);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.GameReview.createOrUpdate(data);
};

export const setStatus = async (data: Partial<Game>) => {
  if (_.isUndefined(data.id)) {
    throw new Error("No game Id found");
  }

  const game = queries.Game.getGameById(data.id);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.Game.update(data.id, { gameStatusId: data.gameStatusId });
};

export const setGamescope = async (data: GameConfigGamescope) => {
  const game = await queries.Game.getGameById(data.gameId);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.GameConfigGamescope.createOrUpdate(data);
  await refreshGame(game.id)
};
