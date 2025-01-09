import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { IStorefront } from "src/main/types";
import { ISteamGame } from "src/common/types";
import { GameStatus, Storefront } from "../../constant";
import { insertMissing } from "../../dal/game";

class Steam implements IStorefront {
  private steamid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async parseResponse(response: AxiosResponse): Promise<ISteamGame[]> {
    const games: ISteamGame[] = [];
    for (const entry of response.data.response.games) {
      games.push({
        id: entry.appid,
        name: entry.name,
        status:
          entry.playtime_forever > 0 ? GameStatus.PLAYED : GameStatus.UNPLAYED,
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
    await insertMissing(games, Storefront.STEAM);
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

      const games = await this.parseResponse(response);

      return games;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Steam;
