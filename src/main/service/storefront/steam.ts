import axios from "axios";

interface Game {
  id: number;
  name: string;
  timePlayed: number;
  lastPlayed: number;
}

interface Storefront {
  getOwnedGames(): Promise<Game[]>;
}

class Steam implements Storefront {
  private steamid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async getSteamUserData() {

  }

  async getOwnedGames() {
    const response = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001",
      {
        params: {
          steamid: this.steamid,
          key: this.apiKey,
          format: "json",
          include_appinfo: 1,
        },
      },
    );

    console.log(response)

    return [];
  }
}

export default Steam
