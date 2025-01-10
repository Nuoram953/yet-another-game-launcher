import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { IStorefront } from "src/main/types";
import { ISteamGame } from "src/common/types";
import { GameStatus, Storefront } from "../../constant";
import * as GameQueries from "../../dal/game";
import * as GameTimePlayedQueries from "../../dal/game_time_played";
import { Game } from "src/main/entities/Game";
import { getGameStatusPlayedAndUnplayed } from "../../dal/game_status";
import { getStorefrontById } from "../../dal/storefront";
import { GameTimePlayed } from "../../entities/GameTimePlayed";
import { v4 as uuidv4 } from 'uuid';

class Steam {
  private steamid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async parseResponse(response: AxiosResponse): Promise<void> {
    const storefront = await getStorefrontById(1);
    const { unplayed, played } = await getGameStatusPlayedAndUnplayed();
    for (const entry of response.data.response.games) {

      const gameTime: GameTimePlayed = {
        id:uuidv4(),
        time_played: entry.playtime_forever,
        time_played_windows: entry.playtime_windows_forever,
        time_played_mac: entry.playtime_mac_forever,
        time_played_linux: entry.playtime_linux_forever,
        time_played_steamdeck: entry.playtime_deck_forever,
        time_played_disconnected: entry.playtime_disconnected,
      };

      const game: Game = {
          id: uuidv4(),
          external_id: entry.appid,
          name: entry.name,
          storefront: storefront!,
          game_status: entry.playtime_forever > 0 ? played : unplayed,
          last_time_played: entry.rtime_last_played,
          is_installed: false,
          game_time_played_id: new GameTimePlayed()
      };

      const dbGame = await GameQueries.createOrUpdate(game, Storefront.STEAM)
      const dbGameTimePlayed = await GameTimePlayedQueries.createOrUpdate(dbGame, gameTime)
    }
  }

  async initialize(): Promise<void> {
    await this.getSteamUserData();
    await this.getOwnedGames();
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

      this.parseResponse(response);

    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Steam;
