import fs from "fs";
import path from "path";
import log from "electron-log/main";
import dataManager from "../../manager/dataChannelManager";
import { getDefaultSteamPath } from "./utils";
import acfParser from "steam-acf2json";
import getFolderSize from "get-folder-size";
import queries from "../../dal/dal";
import { GameWithRelations } from "src/common/types";
import { refreshGame } from "../../service/game";
import { NotificationType, RouteDownload } from "../../../common/constant";
import { delay } from "../../utils/utils";
import notificationManager from "../../manager/notificationManager";

interface DownloadStats {
  id: string;
  progress: number;
  speed: number;
  timeRemaining: number;
  downloadedBytes: number;
  totalBytes: number;
}

class DownloadTracker {
  private steamLibraryPath: string;
  private gameId: string;
  private previousSize: number = 0;
  private lastUpdate: number = Date.now();
  private totalBytes: number = 0;
  private game: GameWithRelations;

  constructor(game: GameWithRelations) {
    this.gameId = game.externalId!.toString();
    this.estimateTotalSize();
    this.game = game;
    this.getDownloadStats();
  }

  private async estimateTotalSize() {
    try {
      const manifestPath = path.join(
        getDefaultSteamPath(),
        "steamapps",
        `appmanifest_${this.gameId}.acf`,
      );

      const file = fs.readFileSync(manifestPath, "utf-8");
      const decode = acfParser.decode(file);
      console.log(decode);
      this.totalBytes = decode.AppState.BytesToStage;
    } catch (error) {
      log.error(`Error reading manifest file for game ${this.gameId}:`, error);
    }
  }

  async getDownloadStats() {
    let isDownloadInProgress = true;
    while (isDownloadInProgress) {
      const downloadingFolder = path.join(
        getDefaultSteamPath(),
        "steamapps/downloading",
        this.gameId,
      );

      if (!fs.existsSync(downloadingFolder)) {
        isDownloadInProgress = false;
        break;
      }

      if (this.totalBytes == null || this.totalBytes == 0) {
        this.estimateTotalSize();
      }

      const totalSize = await getFolderSize.loose(downloadingFolder);

      const now = Date.now();
      const elapsedTime = (now - this.lastUpdate) / 1000; // seconds
      const speed = (totalSize - this.previousSize) / elapsedTime; // bytes per second
      const progress =
        this.totalBytes > 0 ? (totalSize / this.totalBytes) * 100 : 0;
      const timeRemaining =
        speed > 0 && this.totalBytes > 0
          ? (this.totalBytes - totalSize) / speed
          : 0;

      this.previousSize = totalSize;
      this.lastUpdate = now;

      dataManager.send(RouteDownload.ON_DOWNLOAD_STATUS, {
        id: this.game.id,
        progress,
        speed,
        timeRemaining,
        downloadedBytes: totalSize,
        totalBytes: this.totalBytes,
      });

      await delay(3000);
    }
    await this.stop();
  }

  async stop() {
    const manifestPath = path.join(
      getDefaultSteamPath(),
      "steamapps",
      `appmanifest_${this.gameId}.acf`,
    );
    if (fs.existsSync(manifestPath)) {
      await queries.Game.update(this.game.id, { isInstalled: true });
      await refreshGame(this.game.id);
      notificationManager.show({
        id: NotificationType.INSTALLED,
        title: `Download complete`,
        message: `${this.game.name} has been installed.`,
        type: "info",
      });
    }

    dataManager.send(RouteDownload.ON_DOWNLOAD_STOP, {
      id: this.game.id,
    });
    log.info(`Stopped monitoring Steam download for game ${this.gameId}.`);
  }
}

export function createDownloadTracker(
  game: GameWithRelations,
): DownloadTracker {
  return new DownloadTracker(game);
}
