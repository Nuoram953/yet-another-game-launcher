import axios from "axios";
import fs from "fs";
import { MEDIA_TYPE } from "../../common/constant";
import { app } from "electron";
import log from "electron-log";
import _ from "lodash";
import { Game } from "@prisma/client";
import SteamGridDB from "../api/metadata/steamgriddb";
import { YouTubeDownloader } from "../api/video/youtube";
import { GameWithRelations } from "src/common/types";
import { igdb } from "..";
import OpenCritic from "../api/metadata/opencritic";

class MetadataManager {
  private userPath: string;

  constructor() {
    this.userPath = app.getPath("userData");
  }

  async downloadMissing(game:GameWithRelations){
    const sgdb = new SteamGridDB(game);
    await sgdb.getGameIdByExternalId(game.storefront!.name);
    await sgdb.downloadAllImageType(1, 1);

    await igdb.downloadScreenshotsForGame(game, 10)

    await YouTubeDownloader.searchAndDownloadVideos(game);
    
    const openCritic = new OpenCritic()
    await openCritic.search(game.name)
  }

  async getCountAchievementPictures(game: Game) {
    const path = await this.getImageDirectoryPath(MEDIA_TYPE.ACHIEVEMENT, game)
    return await this.getNumberOfFiles(path)
  }

  async getImageDirectoryPath(type: MEDIA_TYPE, game: Game) {
    return `${this.userPath}/${game.id}/${type}`;
  }

  async getOrCreateImageDirectory(type: MEDIA_TYPE, game: Game) {
    const folderPath = await this.getImageDirectoryPath(type, game);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      log.info(`Created directory ${folderPath}`);
    }

    return folderPath;
  }

  async getNumberOfFiles(path: string) {
    if (!fs.existsSync(path)) {
      return 0;
    }

    const items = fs.readdirSync(path);

    if (_.isNil(items)) {
      return 0;
    }
    return items.length;
  }

  async downloadImage(
    type: MEDIA_TYPE,
    game: Game,
    url: string,
    extension: string,
    customName?: string,
  ): Promise<void> {
    try {

      const folderPath = await this.getOrCreateImageDirectory(type, game);
      const countFiles = await this.getNumberOfFiles(folderPath);
      const fileName = !_.isNil(customName)
        ? `/${customName}.${extension}`
        : `/${type}_${countFiles + 1}.${extension}`;

      const destination = folderPath + fileName;
      if(fs.existsSync(destination)){
        return
      }

      const response = await axios.get<Buffer>(url, {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(destination, response.data);
      log.info(`Image saved to ${destination}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Axios error: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${(error as Error).message}`);
      }
    }
  }
}

export default MetadataManager;
