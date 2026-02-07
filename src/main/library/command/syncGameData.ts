import { NotifyProgress, RequireConfig } from "@main/decorator/decorator";
import logger, { LogMethod, LogTag } from "../../logger";
import { MEDIA_TYPE, NotificationType, Storefront } from "@common/constant";
import notificationManager from "@main/manager/notificationManager";
import { GameWithRelations } from "@common/types";
import queries from "@main/dal/dal";
import { downloadImage } from "@main/metadata/downloader";

import * as AchievementService from "@main/achievement/achievement.service";
import * as SteamService from "@main/storefront/steam/service";

import * as YoutubeService from "@main/externalApi/youtube/service";
import * as SteamGridDbService from "@main/externalApi/steamGridDb/service";
import * as InternetGameDatabaseApi from "@main/externalApi/internetGameDatabase";
import * as howLongToBeatApi from "@main/externalApi/howLongToBeat";
import * as openCriticApi from "@main/externalApi/openCritic";
import * as OpenCriticService from "@main/externalApi/openCritic/service";

export class SyncGameDataCommand {
  game: GameWithRelations;
  notificationId: string;

  constructor(game: GameWithRelations) {
    this.game = game;
    this.notificationId = NotificationType.NEW_GAME + game.id;

    notificationManager.show({
      id: this.notificationId,
      title: this.game.name,
      message: "Downloading assets and metadata",
      type: "progress",
      current: 0,
      total: 100,
      autoClose: true,
    });
  }

  @RequireConfig("extension.steamGridDb.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingImages")
  async downloadMediaFromSteamGridDb() {
    const MIN = 3;
    const MAX = 5;

    await SteamGridDbService.downloadMedia(this.game, MEDIA_TYPE.COVER, MIN, MAX);
    await SteamGridDbService.downloadMedia(this.game, MEDIA_TYPE.LOGO, MIN, MAX);
    await SteamGridDbService.downloadMedia(this.game, MEDIA_TYPE.ICON, MIN, MAX);
    await SteamGridDbService.downloadMedia(this.game, MEDIA_TYPE.BACKGROUND, MIN, MAX);
  }

  @RequireConfig("extension.igdb.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingMetadata")
  async updateInfoFromIGDB() {
    const igdbData = await InternetGameDatabaseApi.getGame(this.game);

    if (!igdbData) return;

    await queries.Game.update(this.game.id, igdbData.partialGameData);

    for (const developer of igdbData.developers) {
      await queries.GameDeveloper.findOrCreate(this.game.id, developer);
    }

    for (const publisher of igdbData.publishers) {
      await queries.GamePublisher.findOrCreate(this.game.id, publisher);
    }

    for (const image of igdbData.screenshots) {
      const url = `https:${image}`;
      await downloadImage(MEDIA_TYPE.SCREENSHOT, this.game, url.replace("t_thumb", "t_1080p"), "jpg");
    }

    for (const tag of igdbData.themes) {
      await queries.GameTag.findOrCreate(this.game.id, tag, {
        gameId: this.game.id,
        isTheme: true,
      });
    }

    for (const tag of igdbData.gameModes) {
      await queries.GameTag.findOrCreate(this.game.id, tag, {
        gameId: this.game.id,
        isGameMode: true,
      });
    }

    for (const tag of igdbData.genres) {
      await queries.GameTag.findOrCreate(this.game.id, tag, {
        gameId: this.game.id,
        isGenre: true,
      });
    }

    for (const platform of igdbData.platforms) {
      await queries.GamePlatform.findOrCreate(this.game.id, platform);
    }

    for (const collection of igdbData.collections) {
      await queries.GameFranchise.findOrCreate(this.game.id, collection);
    }
  }

  @RequireConfig("extension.youtube.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingTrailer")
  async downloadVideo() {
    await YoutubeService.downloadVideoForGame(this.game);
  }

  @RequireConfig("extension.youtube.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingMusic")
  async downloadAudio() {
    await YoutubeService.downloadMusicForGame(this.game);
  }

  @RequireConfig("extension.howLongToBeat.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingHowLongToBeat")
  async updateHowLongToBeat() {
    const HowLongToBeatData = await howLongToBeatApi.search(this.game.name);
    await queries.Game.update(this.game.id, {
      mainStory: HowLongToBeatData?.mainStory,
      mainPlusExtra: HowLongToBeatData?.mainPlusExtra,
      completionist: HowLongToBeatData?.completionist,
    });
  }

  @RequireConfig("extension.openCritic.enable")
  @NotifyProgress((self) => self.notificationId, "stepDownloadingOpenCritic")
  async updateOpenCritic() {
    const openCriticData = await openCriticApi.getGame(this.game.name);
    if (!openCriticData) return;

    await OpenCriticService.setGameReviewLanding(this.game, openCriticData.id);
    await queries.Game.update(this.game.id, {
      scoreCritic: openCriticData?.topCriticScore,
    });
  }

  async updateExternalUserReviews() {
    switch (this.game.storefrontId) {
      case Storefront.STEAM: {
        await SteamService.getAppReviews(this.game);
      }
    }
  }

  async updateAchievements() {
    await AchievementService.updateAchievements(this.game);
  }

  async runAll() {
    const tasks: Array<() => Promise<void>> = [
      () => this.downloadMediaFromSteamGridDb(),
      () => this.updateInfoFromIGDB(),
      () => this.downloadVideo(),
      () => this.downloadAudio(),
      () => this.updateHowLongToBeat(),
      () => this.updateOpenCritic(),
      () => this.updateExternalUserReviews(),
      () => this.updateAchievements(),
    ];

    for (const task of tasks) {
      try {
        await task();
      } catch (err) {
        logger.warn(
          `Task failed but continuing`,
          {
            err,
          },
          LogTag.LIBRARY,
        );
      }
    }

    notificationManager.updateProgress(this.notificationId, 100);
  }
}
