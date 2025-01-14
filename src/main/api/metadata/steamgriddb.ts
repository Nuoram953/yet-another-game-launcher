import { Game } from "@prisma/client";
import axios from "axios";
import { IMAGE_TYPE } from "../../../common/constant";
import { metadataManager } from "../../index";
import log from "electron-log/main";
import { delay } from "../../utils/utils";

enum SteamGridDbType {
  GRID = "grid",
  HEROES = "heroes",
  LOGOS = "logos",
  ICONS = "icons",
}

class SteamGridDB {
  private apikey: string | undefined;
  private gameId: number;
  private game: Game;

  constructor(game: Game) {
    this.apikey = process.env.STEAM_GRID_DB_API_KEY;
    this.game = game;
  }

  async downloadAllImageType(countPerType: number) {
    await this.downloadGridForGame(countPerType);
    await this.downladHeroesForGame(countPerType);
    await this.downloadLogosForGame(countPerType);
  }

  async getGameIdByExternalId(
    platform:
      | "steam"
      | "origin"
      | "egs"
      | "bnet"
      | "uplay"
      | "flashpoint"
      | "eshop",
  ) {
    const response = await axios.get(
      `https://www.steamgriddb.com/api/v2/games/${platform}/${this.game.externalId}`,
      { headers: { Authorization: `Bearer ${this.apikey}` } },
    );

    if (response.status != 200) {
      throw new Error("invalid api call");
    }

    this.gameId = response.data.data.id;
  }

  async downloadGridForGame(count: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

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
        IMAGE_TYPE.COVER,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }

  async downladHeroesForGame(count: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

    while (!hasAllImages) {
      const response = await axios.get(
        `https://www.steamgriddb.com/api/v2/heroes/game/${this.gameId}`,
        {
          headers: { Authorization: `Bearer ${this.apikey}` },
          params: {
            gameId: this.gameId,
            styles: "alternate,material",
            dimensions: "1920x620,3840x1240,1600x650",
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
        await delay(2000);
      }
    }

    const data = images.sort((a, b) => b.score - a.score).splice(0, count);

    for (const image of data) {
      await metadataManager.downloadImage(
        IMAGE_TYPE.BACKGROUND,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }

  async downloadLogosForGame(count: number) {
    let images: any[] = [];
    let hasAllImages: boolean = false;
    let page: number = 0;

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
        IMAGE_TYPE.LOGO,
        this.game,
        image.url,
        image.mime.split("image/")[1],
      );
    }
  }
}

export default SteamGridDB;
