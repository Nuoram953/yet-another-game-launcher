import axios from "axios";
import fs from "fs";
import { MEDIA_TYPE } from "../../common/constant";
import { app } from "electron";
import log from "electron-log";
import _ from "lodash";
import { Game } from "@prisma/client";
import { GameWithRelations } from "src/common/types";
import * as SteamGridDbApi from "../externalApi/steamGridDb";

class MetadataManager {
  private userPath: string;

  constructor() {
    this.userPath = app.getPath("userData");
  }

  async deleteMedia(gameId: string, MediaType: MEDIA_TYPE, mediaId: string) {
    const mediaPath = `${this.userPath}/${gameId}/${MediaType}/${mediaId}`;

    fs.unlinkSync(`${mediaPath}`);
  }

  async getCountAchievementPictures(game: Game) {
    const path = await this.getImageDirectoryPath(MEDIA_TYPE.ACHIEVEMENT, game);
    return await this.getNumberOfFiles(path);
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
    extension?: string,
    customName?: string,
  ): Promise<void> {
    try {
      const folderPath = await this.getOrCreateImageDirectory(type, game);
      const countFiles = await this.getNumberOfFiles(folderPath);
      const extensionFromFile = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/)?.[1];
      const fileName = !_.isNil(customName)
        ? `/${customName.replace(/\.[^/.]+$/, "")}.${extension}`
        : `/${type}_${countFiles + 1}.${extension ? extension : extensionFromFile}`;

      const destination = folderPath + fileName;
      if (fs.existsSync(destination)) {
        return;
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
  async search(game: GameWithRelations, mediaType: MEDIA_TYPE, page: number) {
    let res = null;
    switch (mediaType) {
      case MEDIA_TYPE.COVER:
        res = await SteamGridDbApi.searchGrid(game);
        break;
      case MEDIA_TYPE.BACKGROUND:
        res = await SteamGridDbApi.searchHero(game);
        break;
      case MEDIA_TYPE.LOGO:
        res = await SteamGridDbApi.searchLogo(game);
        break;
      case MEDIA_TYPE.ICON:
        res = await SteamGridDbApi.searchIcon(game);
        break;
      default:
        throw new Error("Invalid media type");
    }

    return res.data.map((item) => item.url);
  }
}

export default MetadataManager;
