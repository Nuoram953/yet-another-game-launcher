import log from "electron-log/main";
import { Storefront } from "../../constant";
import axios from "../../../common/axiosConfig";
import { Game } from "@prisma/client";
import { metadataManager } from "../../../main";
import { MEDIA_TYPE } from "../../../common/constant";
import { GameWithRelations } from "../../../common/types";
import _ from "lodash";

class Igdb {
  private expirationInSeconds: number;
  private token: string | null;

  constructor() {
    this.token = null;
  }

  async authentication() {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    );

    if (response.status != 200) {
      log.error("Invalid");
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    this.expirationInSeconds =
      currentTimeInSeconds + Number(response.data.expires_in);
    this.token = response.data.access_token;
    return this.token;
  }

  async getToken() {
    const isValid = Math.floor(Date.now() / 1000) < this.expirationInSeconds;
    return isValid ? this.token : await this.authentication();
  }

  async getGameById(id: number) {
    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields *, screenshots.*; where id = ${id};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    console.log(response.data);

    return response
  }

  async getExternalGame(externalId: string, store?: Storefront) {
    let category = -1;
    switch (store) {
      case Storefront.STEAM:
        category = 1;
        break;
      case Storefront.EPIC:
        category = 26;
    }
    const response = await axios.post(
      "https://api.igdb.com/v4/external_games",
      `fields *; where uid="${externalId}" & external_game_source=${category};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    if(_.isEmpty(response.data)){
      return null
    }

    return response.data[0].game;
  }

  async getInvolvedCompany(id: number) {
    const response = await axios.post(
      "https://api.igdb.com/v4/involved_companies",
      `fields *, company.*;  where game=${id};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    return response.data;
  }

  async getGame(game:GameWithRelations) {
    let id = await this.getExternalGame(game.externalId!, game.storefrontId!);

    if(_.isNil(id)){
      id = await this.search(game.name)
    }

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields *, platforms.*, genres.*, themes.*, game_engines.*, game_modes.*, player_perspectives.*;  where id=${id};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    console.log(response.data)


    const company: object[] = await this.getInvolvedCompany(id);

    const publishers = company
      .filter((company) => company.publisher)
      .map((item) => ({
        name: item.company.name,
        description: item.company.description,
        country: item.company.country,
        startedAt: item.company.start_date,
        url: item.company.url,
      }));

    const developers = company
      .filter((company) => company.developer)
      .map((item) => ({
        name: item.company.name,
        description: item.company.description,
        country: item.company.country,
        startedAt: item.company.start_date,
        url: item.company.url,
      }));

    const data = response.data[0];

    const themes = data.themes?.map((item) => item.name) || [];
    const genres = data.genres?.map((item) => item.name) || [];
    const gameModes = data.game_modes?.map((item) => item.name) || [];
    const engine = data.game_engines?.map((item) => item.name) || [];
    const playerPerspective =
      data.player_perspectives?.map((item) => item.name) || [];

    const partialGameData: Partial<Game> = {
      summary: data.storyline ?? data.summary,
      scoreCritic: data.aggregated_rating ?? null,
      scoreCommunity: data.rating ?? null,
    };

    return {
      publishers,
      developers,
      partialGameData,
      themes,
      genres,
      gameModes,
      engine,
      playerPerspective,
    };
  }

  async search(name: string) {
    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields *; search "${name}"; where version_parent = null;`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    console.log(response.data)

    if(_.isEmpty(response.data)){
      return null
    }

    return response.data[0].id;
  }

  async downloadScreenshotsForGame(
    game: GameWithRelations,
    max: number,
  ) {

    let path = await metadataManager.getImageDirectoryPath(
      MEDIA_TYPE.SCREENSHOT,
      game,
    );
    let files = await metadataManager.getNumberOfFiles(path);
    if (files >= max) {
      log.debug(
        `${game.id} has ${files} ${MEDIA_TYPE.SCREENSHOT} and the max was ${max}. Skipping`,
      );
      return;
    }

    const id = await this.search(game.name);
    if(_.isNull(id)){
      return
    }
    const response = await this.getGameById(id);

    if (response.status !== 200) {
      log.error(response.data.errors);
    }

    if(_.isUndefined(response.data[0].screenshots)){
      return
    }

    if(response.data[0].screenshots.length <= max && files != 0){
      return
    }

    for (const image of response.data[0].screenshots) {
      const url = `https:${image.url}`
      await metadataManager.downloadImage(
        MEDIA_TYPE.SCREENSHOT,
        game,
        url.replace("t_thumb", "t_1080p"),
        "jpg",
      );
    }
  }
}

export default Igdb;
