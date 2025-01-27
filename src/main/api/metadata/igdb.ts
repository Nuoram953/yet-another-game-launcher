import log from "electron-log/main";
import { Storefront } from "../../constant";
import axios from "../../../common/axiosConfig";
import { Game } from "@prisma/client";

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

  async getExternalGame(externalId: number, store?: Storefront) {
    const response = await axios.post(
      "https://api.igdb.com/v4/external_games",
      `fields *; where uid="${externalId}" & category=${1};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

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

  async getGame(externalId: number, store?: Storefront) {
    const id = await this.getExternalGame(externalId, store);

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields *, platforms.*, genres.*, themes.*;  where id=${id};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    const company: object[] = await this.getInvolvedCompany(id);

    const publishers = company
      .filter((company) => company.publisher)
      .map((item) => item.company.name);

    const developers = company
      .filter((company) => company.developer)
      .map((item) => item.company.name);

    const themes = response.data[0].themes.map((item) => item.name);
    const genres = response.data[0].genres.map((item) => item.name);

    const partialGameData: Partial<Game> = {
      summary: response.data[0].storyline ?? response.data[0].summary,
      scoreCritic: response.data[0].aggregated_rating ?? null,
      scoreCommunity: response.data[0].rating ?? null,
    };

    return { publishers, developers, partialGameData, themes, genres };
  }
}

export default Igdb;
