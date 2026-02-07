import {
  Game,
  GameConfigGamescope,
  GameLaunchApp,
  GameLaunchEmulation,
  GameReview,
  GameReviewThoughts,
} from "@prisma/client";
import queries from "../dal/dal";
import { Storefront } from "../../common/constant";
import { i18n } from "..";
import { killDirectoyProcess } from "../utils/tracking";
import { delay, getKeyPercentage } from "../utils/utils";
import _ from "lodash";
import { GameWithRelations, LaunchType } from "../../common/types";
import dataManager from "../manager/dataChannelManager";
import { DataRoute, MEDIA_TYPE, NotificationType } from "../../common/constant";
import { createDownloadTracker } from "../storefront/steam/monitor";
import notificationManager from "../manager/notificationManager";

import * as SteamService from "@main/storefront/steam/service";
import * as YoutubeService from "../externalApi/youtube/service";
import * as MetadataService from "@main/metadata/index";
import * as OpenCriticService from "../externalApi/openCritic/service";
import * as ConfigService from "@main/config/config.service";
import * as AchievementService from "../achievement/achievement.service";

import * as SteamCommand from "../storefront/steam/commands";
import * as EpicCommand from "../storefront/epic/commands";

import * as howLongToBeatApi from "../externalApi/howLongToBeat";
import * as internetGameDatabaseApi from "../externalApi/internetGameDatabase";
import * as SteamGridDbService from "../externalApi/steamGridDb/service";
import * as openCriticApi from "../externalApi/openCritic";
import { SyncGameDataCommand } from "@main/library/command/syncGameData";

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

export const kill = async (id: string, launchId: number, type: LaunchType) => {
  const game = await queries.Game.getGameById(id);
  let location: string | null = null;

  switch (type) {
    case LaunchType.APP:
      {
        const launch = await queries.GameLaunchApp.getById(launchId);
        location = launch.path!;
      }
      break;
    case LaunchType.EMULATOR:
      {
        const launch = await queries.GameLaunchEmulator.getById(launchId);
        location = launch.path!;
      }
      break;
    case LaunchType.STOREFRONT:
      {
        location = game.location!;
      }
      break;
  }

  console.log("Killing game at location:", location);
  await killDirectoyProcess(location);

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });
};

export const updateExternalUserReviews = async (game: GameWithRelations) => {
  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamService.getAppReviews(game);
    }
  }
};

export const create = async (data: Partial<Game>, store: Storefront) => {
  const game = await queries.Game.createOrUpdateExternal(data, store);

  await updateInfo(game.id);

  await queries.GameLaunchStorefront.createOrUpdate({
    name: game.storefront.name,
    gameId: game.id,
    externalId: game.externalId!,
    storefrontId: game.storefrontId,
    isEnabled: true,
  });

  return game;
};

export const update = async (data: Partial<Game>) => {
  const game = await queries.Game.getGameById(data.id);

  await queries.Game.update(game.id, data);
};

export const updateInfo = async (id: string) => {
  const game = await queries.Game.getGameById(id);

  await new SyncGameDataCommand(game!).runAll();

  return;

  const notificationId = NotificationType.NEW_GAME + game.id;
  notificationManager.show({
    id: notificationId,
    title: game.name,
    message: "Downloading assets and metadata",
    type: "progress",
    current: 0,
    total: 100,
    autoClose: true,
  });

  const notificationsObject = i18n.t("newGame", { ns: "notification", returnObjects: true });

  if (await ConfigService.get("extension.steamGridDb.enable")) {
    await SteamGridDbService.downloadMedia(game, MEDIA_TYPE.COVER, 3, 5);
    await SteamGridDbService.downloadMedia(game, MEDIA_TYPE.LOGO, 3, 5);
    await SteamGridDbService.downloadMedia(game, MEDIA_TYPE.ICON, 3, 5);
    await SteamGridDbService.downloadMedia(game, MEDIA_TYPE.BACKGROUND, 3, 5);
  }

  if (await ConfigService.get("extension.igdb.enable")) {
    notificationManager.updateProgress(
      notificationId,
      getKeyPercentage(notificationsObject, "stepDownloadingAssets"),
      i18n.t("newGame.stepDownloadingAssets", { ns: "notification" }),
    );

    const igdbData = await internetGameDatabaseApi.getGame(game);
    if (!_.isNil(igdbData)) {
      await queries.Game.update(game.id, igdbData.partialGameData);

      notificationManager.updateProgress(
        notificationId,
        getKeyPercentage(notificationsObject, "stepAddingDevelopers"),
        i18n.t("newGame.stepAddingDevelopers", { ns: "notification" }),
      );
      for (const developer of igdbData.developers) {
        await queries.GameDeveloper.findOrCreate(game.id, developer);
      }

      notificationManager.updateProgress(
        notificationId,
        getKeyPercentage(notificationsObject, "stepAddingPublishers"),
        i18n.t("newGame.stepAddingPublishers", { ns: "notification" }),
      );
      for (const publisher of igdbData.publishers) {
        await queries.GamePublisher.findOrCreate(game.id, publisher);
      }

      notificationManager.updateProgress(
        notificationId,
        getKeyPercentage(notificationsObject, "stepDownloadingScreenshots"),
        i18n.t("newGame.stepDownloadingScreenshots", { ns: "notification" }),
      );
      for (const image of igdbData.screenshots) {
        const url = `https:${image}`;
        await MetadataService.downloadImage(MEDIA_TYPE.SCREENSHOT, game, url.replace("t_thumb", "t_1080p"), "jpg");
      }

      notificationManager.updateProgress(
        notificationId,
        getKeyPercentage(notificationsObject, "stepDownloadingTags"),
        i18n.t("newGame.stepDownloadingTags", { ns: "notification" }),
      );
      for (const tag of igdbData.themes) {
        await queries.GameTag.findOrCreate(game.id, tag, {
          gameId: game.id,
          isTheme: true,
        });
      }

      for (const tag of igdbData.gameModes) {
        await queries.GameTag.findOrCreate(game.id, tag, {
          gameId: game.id,
          isGameMode: true,
        });
      }

      for (const tag of igdbData.genres) {
        await queries.GameTag.findOrCreate(game.id, tag, {
          gameId: game.id,
          isGenre: true,
        });
      }

      for (const platform of igdbData.platforms) {
        await queries.GamePlatform.findOrCreate(game.id, platform);
      }

      for (const collection of igdbData.collections) {
        await queries.GameFranchise.findOrCreate(game.id, collection);
      }
    }
  }

  if (await ConfigService.get("extension.youtube.enable")) {
    notificationManager.updateProgress(
      notificationId,
      getKeyPercentage(notificationsObject, "stepDownloadingTrailer"),
      i18n.t("newGame.stepDownloadingTrailer", { ns: "notification" }),
    );
    await YoutubeService.downloadVideoForGame(game);
  }

  if (await ConfigService.get("extension.youtube.enable")) {
    notificationManager.updateProgress(
      notificationId,
      getKeyPercentage(notificationsObject, "stepDownloadingMusic"),
      i18n.t("newGame.stepDownloadingOst", { ns: "notification" }),
    );
    await YoutubeService.downloadMusicForGame(game);
  }

  if (await ConfigService.get("extension.howLongToBeat.enable")) {
    notificationManager.updateProgress(
      notificationId,
      getKeyPercentage(notificationsObject, "stepDownloadingHltb"),
      i18n.t("newGame.stepDownloadingHltb", { ns: "notification" }),
    );
    const HowLongToBeatData = await howLongToBeatApi.search(game.name);
    await queries.Game.update(game.id, {
      mainStory: HowLongToBeatData?.mainStory,
      mainPlusExtra: HowLongToBeatData?.mainPlusExtra,
      completionist: HowLongToBeatData?.completionist,
    });
  }

  notificationManager.updateProgress(
    notificationId,
    getKeyPercentage(notificationsObject, "stepOpenCritcicData"),
    i18n.t("newGame.stepOpenCritcicData", { ns: "notification" }),
  );
  await updateExternalUserReviews(game);

  if (await ConfigService.get("extension.openCritic.enable")) {
    const openCriticData = await openCriticApi.getGame(game.name);
    await OpenCriticService.setGameReviewLanding(game, openCriticData.id);
    await queries.Game.update(game.id, {
      scoreCritic: openCriticData?.topCriticScore,
    });
  }

  notificationManager.updateProgress(
    notificationId,
    getKeyPercentage(notificationsObject, "stepDownloadingAchievements"),
    i18n.t("newGame.stepDownloadingAchievements", { ns: "notification" }),
  );

  await AchievementService.updateAchievements(game);

  dataManager.send(DataRoute.REQUEST_GAMES, {});

  notificationManager.updateProgress(notificationId, 100);

  await delay(3000);
};

export const refreshGame = async (gameId: string) => {
  dataManager.send(DataRoute.REQUEST_GAME, {
    ...(await queries.Game.getGameById(gameId)),
  });
};

export const refreshLibrary = async () => {
  dataManager.send("request:games", {});
};

export const getReview = async (id: string) => {
  if (_.isUndefined(id)) {
    throw new Error("No game Id found");
  }

  const game = queries.Game.getGameById(id);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  return {
    review: await queries.GameReview.getByGameId(id),
    thoughts: await queries.GameReviewThoughts.getByGameId(id),
  };
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

export const createReviewThought = async (gameId: string) => {
  if (_.isUndefined(gameId)) {
    throw new Error("No game Id found");
  }

  const game = queries.Game.getGameById(gameId);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  return await queries.GameReviewThoughts.create(gameId);
};

export const updateReviewThought = async (data: Partial<GameReviewThoughts>) => {
  if (_.isUndefined(data.id)) {
    throw new Error("No game review thought Id found");
  }

  return await queries.GameReviewThoughts.update(data.id, { ...data });
};

export const deleteReviewThought = async (id: string) => {
  if (_.isUndefined(id)) {
    throw new Error("No game review thought Id found");
  }

  return await queries.GameReviewThoughts.deleteById(id);
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
  await refreshGame(game.id);
};

export const setFavorite = async (id: string, isFavorite: boolean) => {
  const game = await queries.Game.getGameById(id);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.Game.update(id, { isFavorite });
  await refreshGame(game.id);
};

export const refreshProgressTracker = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  const data = await howLongToBeatApi.search(game.name);
  await queries.Game.update(id, {
    mainStory: data?.mainStory,
    mainPlusExtra: data?.mainPlusExtra,
    completionist: data?.completionist,
  });

  await refreshGame(game.id);
};

export const refreshInfo = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await updateInfo(game.id);

  await refreshGame(game.id);
};

export const resetReview = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.GameReview.deleteByGameId(game.id);

  await refreshGame(game.id);
};

export const createOrUpdateLaunchApp = async (data: Partial<GameLaunchApp>) => {
  return await queries.GameLaunchApp.createOrUpdate(data);
};

export const createOrUpdateLaunchEmulator = async (data: Partial<GameLaunchEmulation>) => {
  return await queries.GameLaunchEmulator.createOrUpdate(data);
};

export const deleteLaunch = async (type: LaunchType, id: number) => {
  switch (type) {
    case LaunchType.APP:
      {
        await queries.GameLaunchApp.deleteById(id);
      }
      break;
    case LaunchType.EMULATOR:
      {
        await queries.GameLaunchEmulator.deleteById(id);
      }
      break;
  }
};
