import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { IStorefront } from "src/main/types";
import { Game } from "src/main/entities/Game";
import { IGame } from "src/common/types";
import { GameStatus } from "../../constant";
import { insertMissing } from "../../dal/game";

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
        status: entry.playtime_forever
          ? GameStatus.PLAYED
          : GameStatus.UNPLAYED,
        timePlayed: entry.playtime_forever,
        playtimeWindows: entry.playtime_windows_forever,
        playtimeMac: entry.playtime_mac_forever,
        playtimeLinux: entry.playtime_linux_forever,
        playtimeSteamDeck: entry.playtime_deck_forever,
        lastPlayed: entry.rtime_last_played,
        playtimeDisconnected: entry.playtime_disconnected,
      });
    }
    return games;
  }

  async initialize(): Promise<void> {
    await this.getSteamUserData();
    const games = await this.getOwnedGames();
    await insertMissing(games, 1);
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
  //https://steamcdn-a.akamaihd.net/steam/apps/1422450/library_600x900_2x.jpg
  //
  async downloadImage(url: string, destination: string): Promise<void> {
    try {
      const response = await axios.get<Buffer>(url, {
        responseType: "arraybuffer", // Ensure the response is treated as binary data
      });

      fs.writeFileSync(destination, response.data);
      console.log(`Image saved to ${destination}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Axios error: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${(error as Error).message}`);
      }
    }
  }
}

export default Steam;
