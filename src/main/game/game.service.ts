import { Game, GameConfigGamescope, GameReview } from "@prisma/client";
import queries from "../dal/dal";
import { Storefront } from "../../common/constant";
import { i18n } from "..";
import { killDirectoyProcess } from "../utils/tracking";
import { delay, getKeyPercentage } from "../utils/utils";
import _ from "lodash";
import { GameWithRelations } from "../../common/types";
import dataManager from "../manager/dataChannelManager";
import { DataRoute, MEDIA_TYPE, NotificationType } from "../../common/constant";
import { createDownloadTracker } from "../storefront/steam/monitor";
import notificationManager from "../manager/notificationManager";

import * as SteamService from "@main/storefront/steam/service";
import * as YoutubeService from "../externalApi/youtube/service";
import * as MetadataService from "@main/metadata/index";
import * as ConfigService from "@main/config/config.service";

import * as SteamCommand from "../storefront/steam/commands";
import * as EpicCommand from "../storefront/epic/commands";

import * as howLongToBeatApi from "../externalApi/howLongToBeat";
import * as internetGameDatabaseApi from "../externalApi/internetGameDatabase";
import * as SteamGridDbService from "../externalApi/steamGridDb/service";
import * as openCriticApi from "../externalApi/openCritic";

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

export const updateAchievements = async (game: GameWithRelations) => {
  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamService.getGameAchievements(game);
      await SteamService.getPlayerAchievements(game);
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
  forceDownloadMetadata: boolean = false,
) => {
  const game = await queries.Game.createOrUpdateExternal(data, store);
  if (!game) {
    throw new Error("invalid game");
  }

  if (game.updatedAt.getTime() !== game.createdAt.getTime() && !forceDownloadMetadata) {
    return;
  }

  const notificationId = NotificationType.NEW_GAME + game.id;
  notificationManager.show({
    id: notificationId,
    title: forceDownloadMetadata ? `Adding Metadata to ${game.name}` : `Adding ${game.name} to library`,
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

  if (await ConfigService.get("extension.openCritic.enable")) {
    notificationManager.updateProgress(
      notificationId,
      getKeyPercentage(notificationsObject, "stepOpenCritcicData"),
      i18n.t("newGame.stepOpenCritcicData", { ns: "notification" }),
    );
    const openCriticData = await openCriticApi.getGame(game.name);
  }

  notificationManager.updateProgress(
    notificationId,
    getKeyPercentage(notificationsObject, "stepDownloadingAchievements"),
    i18n.t("newGame.stepDownloadingAchievements", { ns: "notification" }),
  );

  await updateAchievements(game);

  dataManager.send(DataRoute.REQUEST_GAMES, {});

  notificationManager.updateProgress(notificationId, 100);

  await delay(3000);
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
  await refreshGame(game.id);
};

export const setFavorite = async (data: Partial<Game>) => {
  const game = await queries.Game.getGameById(data.id!);

  if (_.isNil(game)) {
    throw new Error("Invalid game");
  }

  await queries.Game.update(data.id!, { isFavorite: data.isFavorite });
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

  await createOrUpdateGame(game, game.storefrontId, true);

  await refreshGame(game.id);
};
