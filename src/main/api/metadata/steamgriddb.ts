import { Game } from "src/main/entities/Game";
import axios from "axios";

class SteamGridDB {
  private apikey: string | undefined;
  private gameId: number;

  constructor() {
    this.apikey = process.env.STEAM_GRID_DB_API_KEY;
  }

  async getGameIdByExternalId(
    game: Game,
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
      `https://www.steamgriddb.com/api/v2/games/${platform}/${game.external_id}`,
      { headers: { Authorization: `Bearer ${this.apikey}` } },
    );

    if (response.status != 200) {
      throw new Error("invalid api call");
    }

    console.log(response.data);

    this.gameId = response.data.data.id;
  }
}

export default SteamGridDB;
