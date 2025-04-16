import { Game, GameConfigGamescope, GameReview } from "@prisma/client";
import queries from "../dal/dal";
import { Storefront } from "../constant";
import { igdb, logger } from "..";
import {
  killDirectoyProcess,
  monitorDirectoryProcesses,
} from "../utils/tracking";
import { delay, getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import SteamGridDB from "../api/metadata/steamgriddb";
import Steam from "../api/storefront/steam";
import _ from "lodash";
import { GameWithRelations } from "../../common/types";
import dataManager from "../manager/dataChannelManager";
import { DataRoute, NotificationType } from "../../common/constant";
import { createDownloadTracker } from "../storefront/steam/monitor";
import * as SteamCommand from "../storefront/steam/commands";
import * as EpicCommand from "../storefront/epic/commands";
import notificationManager from "../manager/notificationManager";
import { LogTag } from "../manager/logManager";

export const preLaunch = async (game: GameWithRelations) => {
  logger.info(`preLaunch for game`, { id: game.id }, LogTag.TRACKING);
};

export const launch = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }
  await preLaunch(game);
  logger.info(`Launch game`, { id: game.id }, LogTag.TRACKING);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamCommand.run(game);
      break;
    }
    case Storefront.EPIC: {
      await EpicCommand.run(game);
      break;
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

    case Storefront.EPIC: {
      EpicCommand.install(game);
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
  logger.info(`postLaunch for game`, { id: game.id }, LogTag.TRACKING);
  if (startTime && endTime) {
    const minutes = await getMinutesBetween(startTime, endTime);
    if (minutes > 0) {
      await createGameActiviy(game.id, startTime, endTime);
      await queries.Game.updateTimePlayed(game.id, minutes + 5);
    } else {
      logger.info(
        `Game session for ${game.id} was ${minutes} minutes. Won't create a game activity`,
      );
    }

    if (game.gameStatusId === 7){
      await queries.Game.update(game.id, { gameStatusId: 6 });
    }

    await updateAchievements(game);
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });

  await refreshGame(game.id);
};

export const updateAchievements = async (game: GameWithRelations) => {
  // const countAchievements = game.achievements.length;
  // const countAchievementPictures =
  //   await metadataManager.getCountAchievementPictures(game);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      const storeSteam = new Steam();
      await storeSteam.getAchievementsForGame(game);
      await storeSteam.getUserAchievementsForGame(game.id);
    }
    case Storefront.EPIC: {
      // const storeEpic = new Steam();
      // await storeEpic.getAchievementsForGame(game);
      // await storeEpic.getUserAchievementsForGame(game);
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
    notificationManager.show({
      id: NotificationType.NEW_GAME + game.id,
      title: `Adding ${game.name} to library`,
      message: "Downloading partial assets and metadata",
      type: "progress",
      current: 10,
      total: 100,
      autoClose: true,
    });
    const sgdb = new SteamGridDB(game);
    await sgdb.getGameIdByExternalId(game.storefront!.name);
    await sgdb.downloadAllImageType(1, 1);

    notificationManager.updateProgress(
      NotificationType.NEW_GAME + game.id,
      25,
      "Downloading metadata",
    );

    try {
      const { developers, publishers, partialGameData } =
        await igdb.getGame(game);
      await queries.Game.update(game.id, partialGameData);

      notificationManager.updateProgress(
        NotificationType.NEW_GAME + game.id,
        55,
        "Updating developers field",
      );
      for (const developer of developers) {
        await queries.GameDeveloper.findOrCreate(game.id, developer);
      }

      notificationManager.updateProgress(
        NotificationType.NEW_GAME + game.id,
        75,
        "Updating publishers field",
      );
      for (const publisher of publishers) {
        await queries.GamePublisher.findOrCreate(game.id, publisher);
      }
    } catch (e) {
      console.log(e);
    }

    notificationManager.updateProgress(
      NotificationType.NEW_GAME + game.id,
      100,
    );

    dataManager.send(DataRoute.REQUEST_GAMES,{})

    await delay(2000);
  }
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
  if (game.storefrontId == Storefront.STEAM) {
    const storeSteam = new Steam();
    await storeSteam.updateLaunchOptions(game, data);
  }
  await refreshGame(game.id);
};
