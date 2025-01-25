import log from "electron-log/main";
import { Storefront } from "../../constant";
import axios from "../../../common/axiosConfig";

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

  async getGame(externalId: number, store?: Storefront) {
    const id = await this.getExternalGame(externalId, store);

    const response = await axios.post(
      "https://api.igdb.com/v4/games",
      `fields *, screenshots.*, platforms.*, artworks.*, genres.*, themes.*, cover.*;  where id=${id};`,
      {
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );

    console.log(response.data);
    const company = await this.getInvolvedCompany(id)
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

    console.log(response.data);
  }
}

export default Igdb;
