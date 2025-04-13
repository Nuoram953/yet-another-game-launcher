import { Game } from "@prisma/client";
import axios from "axios";
import { MEDIA_TYPE, NotificationType } from "../../../common/constant";
import { mainApp, metadataManager } from "../../index";
import log from "electron-log/main";
import { delay } from "../../utils/utils";
import notificationManager from "../../../main/manager/notificationManager";

class SteamGridDB {
  private apikey: string | undefined;
  private gameId: number;
  private game: Game;

  constructor(game: Game) {
    this.apikey = process.env.STEAM_GRID_DB_API_KEY;
    this.game = game;
  }

  async downloadAllImageType(countPerType: number, max: number) {
    await this.downladHeroesForGame(countPerType, max);
    await this.downloadGridForGame(countPerType, max);
    await this.downloadLogosForGame(countPerType, max);
  }

  async getGameIdByExternalId(platform: string) {
    const response = await axios.get(
      `https://www.steamgriddb.com/api/v2/games/${platform}/${this.game.externalId}`,
      {
        headers: { Authorization: `Bearer ${this.apikey}` },
        validateStatus: (status) => true,
      },
    );

    if (response.status == 404) {
      this.gameId = await this.searchByGameName(this.game.name);
    } else {
      this.gameId = response.data.data.id;
    }
  }

  async searchByGameName(name: string) {
    const response = await axios.get(
      `https://www.steamgriddb.com/api/v2/search/autocomplete/${name}`,
      { headers: { Authorization: `Bearer ${this.apikey}` } },
    );

    if (response.status != 200) {
      throw new Error("invalid api call");
    }

    return response.data.data[0].id;
  }

  async downloadGridForGame(count: number, max: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

    let path = await metadataManager.getImageDirectoryPath(
      MEDIA_TYPE.COVER,
      this.game,
    );
    let files = await metadataManager.getNumberOfFiles(path);
    if (files >= max) {
      log.debug(
        `${this.game.id} has ${files} cover and the max was ${max}. Skipping`,
      );
      return;
    }

    notificationManager.updateProgress(NotificationType.NEW_GAME+this.game.id, 35, "Downloading covers")

    while (!hasAllImages) {
      const response = await axios.get(
        `https://www.steamgriddb.com/api/v2/grids/game/${this.gameId}`,
        {
          headers: { Authorization: `Bearer ${this.apikey}` },
          params: {
            gameId: this.gameId,
            styles: "alternate,material",
            dimensions: "600x900",
            mimes: "image/jpeg,image/png",
            type: "static",
            limit: 50,
            page: page,
          },
        },
      );

      if (response.status !== 200) {
        log.error(response.data.errors);
      }

      if (images.length >= response.data.total) {
        hasAllImages = true;
      } else {
        images = [...images, ...response.data.data];
        page += 1;
        await delay(2000);
      }
    }

    const data = images.sort((a, b) => b.score - a.score).splice(0, count);

    for (const image of data) {
      await metadataManager.downloadImage(
        MEDIA_TYPE.COVER,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }

  async downladHeroesForGame(count: number, max: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

    let path = await metadataManager.getImageDirectoryPath(
      MEDIA_TYPE.BACKGROUND,
      this.game,
    );
    let files = await metadataManager.getNumberOfFiles(path);
    if (files >= max) {
      log.debug(
        `${this.game.id} has ${files} background and the max was ${max}. Skipping`,
      );
      return;
    }

    notificationManager.updateProgress(NotificationType.NEW_GAME+this.game.id, 40, "Downloading backgrounds")

    while (!hasAllImages) {
      const response = await axios.get(
        `https://www.steamgriddb.com/api/v2/heroes/game/${this.gameId}`,
        {
          headers: { Authorization: `Bearer ${this.apikey}` },
          params: {
            gameId: this.gameId,
            styles: "alternate,material",
            dimensions: "3840x1240,1920x620",
            mimes: "image/jpeg,image/png,image/webp",
            type: "static",
            limit: 50,
            page: page,
          },
        },
      );

      if (response.status !== 200) {
        log.error(response.data.errors);
      }

      if (images.length >= response.data.total) {
        hasAllImages = true;
      } else {
        images = [...images, ...response.data.data];
        page += 1;
        await delay(1000);
      }
    }

    const data = images.sort((a, b) => b.score - a.score).splice(0, count);

    for (const image of data) {
      await metadataManager.downloadImage(
        MEDIA_TYPE.BACKGROUND,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }

  async downloadLogosForGame(count: number, max: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

    let path = await metadataManager.getImageDirectoryPath(
      MEDIA_TYPE.LOGO,
      this.game,
    );
    let files = await metadataManager.getNumberOfFiles(path);
    if (files >= max) {
      log.debug(
        `${this.game.id} has ${files} logo and the max was ${max}. Skipping`,
      );
      return;
    }

    notificationManager.updateProgress(NotificationType.NEW_GAME+this.game.id, 45, "Downloading logos")

    while (!hasAllImages) {
      const response = await axios.get(
        `https://www.steamgriddb.com/api/v2/logos/game/${this.gameId}`,
        {
          headers: { Authorization: `Bearer ${this.apikey}` },
          params: {
            gameId: this.gameId,
            styles: "official,white,black",
            mimes: "image/png,image/webp",
            type: "static",
            limit: 50,
            page: page,
          },
        },
      );

      if (response.status !== 200) {
        log.error(response.data.errors);
      }

      if (images.length >= response.data.total) {
        hasAllImages = true;
      } else {
        images = [...images, ...response.data.data];
        page += 1;
        await delay(2000);
      }
    }

    const data = images.sort((a, b) => b.score - a.score).splice(0, count);

    for (const image of data) {
      await metadataManager.downloadImage(
        MEDIA_TYPE.LOGO,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }
}

export default SteamGridDB;
