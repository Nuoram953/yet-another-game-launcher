import log from "electron-log/main";
import { Storefront } from "../../constant";
import axios from "../../../common/axiosConfig";

class Igdb {
  private expirationInSeconds: number;
  private token: string | null;

  constructor() {
    this.token = null
  }

  async authentication() {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    );

    if (response.status != 200) {
      log.error("Invalid");
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000); // Current time in seconds
    this.expirationInSeconds = currentTimeInSeconds+Number(response.data.expires_in);
    this.token = response.data.access_token;
  }

  isTokenValid(): boolean {
    console.log(Math.floor(Date.now() / 1000) )
    console.log(this.expirationInSeconds)
    return Math.floor(Date.now() / 1000) < this.expirationInSeconds;
  }

  async getExternalGame(externalId: number, store?: Storefront) {
    console.log(this.token == null)
    console.log(!this.isTokenValid())
    if (this.token === null || !this.isTokenValid()) {
      await this.authentication();
    }

    const response = await axios.post(
      "https://api.igdb.com/v4/external_games",
      `fields *; where uid="${externalId}" & category=${1};`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
          "Client-ID": process.env.IGDB_CLIENT_ID,
        },
      },
    );
  }
}

export default Igdb;
