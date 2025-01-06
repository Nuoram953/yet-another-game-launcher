import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { IGame, IStorefront } from "src/main/types";
import { Game } from "src/main/entities/Game";
import { getAllGames, insertMissing } from "~/dal/game";



class Steam implements IStorefront {
  private steamid: string | undefined;
  private apiKey: string | undefined;
  private personaName: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async parseGames(response: AxiosResponse): Promise<IGame[]> {
    const games: IGame[] = [];
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
    const games = await this.getOwnedGames();
    await insertMissing(games)
    return await getAllGames()
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

      const games = await this.parseGames(response);

      return games;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Steam;
