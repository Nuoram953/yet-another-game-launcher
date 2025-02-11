import fs from "fs";
import path from "path";
import { promisify } from "util";
import log from "electron-log/main";
import dataManager from "../../manager/dataChannelManager";
import { getDefaultSteamPath } from "./utils";
import acfParser from "steam-acf2json";
import getFolderSize from "get-folder-size"

import vdf from "vdf";

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

interface DownloadStats {
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

  constructor(gameId: string) {
    this.gameId = gameId;
    this.estimateTotalSize();
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
      console.log(decode)
      this.totalBytes = decode.AppState.BytesToStage
    } catch (error) {
      log.error(`Error reading manifest file for game ${this.gameId}:`, error);
    }
  }

  async getDownloadStats(): Promise<DownloadStats> {
    try {
      const downloadingFolder = path.join(
        getDefaultSteamPath(),
        "steamapps/downloading",
        this.gameId,
      );

      if(this.totalBytes == null || this.totalBytes == 0){
        this.estimateTotalSize()
      }

      const totalSize = await getFolderSize.loose(downloadingFolder)

      const now = Date.now();
      const elapsedTime = (now - this.lastUpdate) / 1000; // seconds
      const speed = (totalSize - this.previousSize) / elapsedTime; // bytes per second
      const progress =
        this.totalBytes > 0 ? (totalSize / this.totalBytes) * 100 : 0;
      const timeRemaining =
        speed > 0 && this.totalBytes > 0
          ? (this.totalBytes - totalSize) / speed
          : 0;

      log.info(totalSize, this.totalBytes )

      this.previousSize = totalSize;
      this.lastUpdate = now;

      return {
        progress,
        speed,
        timeRemaining,
        downloadedBytes: totalSize,
        totalBytes: this.totalBytes,
      };
    } catch (error) {
      log.error(
        `Error getting Steam download stats for game ${this.gameId}:`,
        error,
      );
      this.stop()
    }
  }

  registerWithDataManager() {
    dataManager.registerProvider(
      `steam-download-${this.gameId}`,
      this.getDownloadStats.bind(this),
    );
    dataManager.startRealtimeUpdates(`steam-download-${this.gameId}`, 1000);
    log.info(`Registered and started monitoring for game ${this.gameId}.`);
  }

  stop() {
    dataManager.stopRealtimeUpdates(`steam-download-${this.gameId}`);
    log.info(`Stopped monitoring Steam download for game ${this.gameId}.`);
  }
}

export function createDownloadTracker(gameId: string): DownloadTracker {
  return new DownloadTracker(gameId);
}
