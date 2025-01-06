import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";

interface Game {
  id: number;
  name: string;
  timePlayed: number;
}

interface Storefront {
  initialize(): Promise<Game[]>;
  getOwnedGames(): Promise<Game[]>;
  parseGames(response: any): Promise<Game[]>;
}

class Steam implements Storefront {
  private steamid: string | undefined;
  private apiKey: string | undefined;
  private personaName: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async parseGames(response: AxiosResponse): Promise<Game[]> {
    const games: Game[] = [];
    for (const entry of response.data.response.games) {
      games.push({
        id: entry.appid,
        name: entry.name,
        timePlayed: entry.playtime_forever,
      });
    }
    return games;
  }

  async initialize(): Promise<Game[]> {
    await this.getSteamUserData();
    return await this.getOwnedGames();
  }

  async getSteamUserData() {
    const steamConfigDirectory = path.join(
      app.getPath("userData"),
      "../../.steam/steam/config",
    );
    const data = await fs.promises.readFile(
      `${steamConfigDirectory}/loginusers.vdf`,
      "utf8",
    );

    const loginUsersJson = await vdf.parse(data);
    const users = Object.entries(loginUsersJson.users);

    const user = users[0];
    this.steamid = user[0];
    this.personaName = user[1]["PersonaName"];
    console.log(this.steamid, this.personaName);
  }

  async getOwnedGames() {
    try {
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

      console.log(response);

      const games = await this.parseGames(response);

      return games;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Steam;
