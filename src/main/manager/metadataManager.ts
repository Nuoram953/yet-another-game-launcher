import axios from "axios";
import fs from "fs";
import { IMAGE_TYPE } from "../../common/constant";
import { app } from "electron";
import log from "electron-log";
import _ from "lodash";
import { Game } from "@prisma/client";
import SteamGridDB from "../api/metadata/steamgriddb";
import { YouTubeDownloader } from "../api/video/youtube";

class MetadataManager {
  private userPath: string;

  constructor() {
    this.userPath = app.getPath("userData");
  }

  async downloadMissing(game:Game){
    const sgdb = new SteamGridDB(game);
    await sgdb.getGameIdByExternalId("steam");
    await sgdb.downloadAllImageType(1, 1);

    await YouTubeDownloader.searchAndDownloadVideos(game);
  }

  async getCountAchievementPictures(game: Game) {
    const path = await this.getImageDirectoryPath(IMAGE_TYPE.ACHIEVEMENT, game)
    return await this.getNumberOfFiles(path)
  }

  async getImageDirectoryPath(type: IMAGE_TYPE, game: Game) {
    return `${this.userPath}/${game.id}/${type}`;
  }

  async getOrCreateImageDirectory(type: IMAGE_TYPE, game: Game) {
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
    type: IMAGE_TYPE,
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
