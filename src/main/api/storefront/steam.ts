import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { GameStatus, Storefront } from "../../constant";
import * as GameQueries from "../../dal/game";
import { getGameStatusPlayedAndUnplayed } from "../../dal/game_status";
import { getStorefrontById } from "../../dal/storefront";
import { v4 as uuidv4 } from 'uuid';
import { Game, GameTimePlayed } from "@prisma/client";

class Steam {
  private steamid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async parseResponse(response: AxiosResponse): Promise<void> {
    for (const entry of response.data.response.games) {

      //const gameTime: GameTimePlayed = {
      //  id:uuidv4(),
      //  timePlayed: entry.playtime_forever,
      //  timePlayed_windows: entry.playtime_windows_forever,
      //  timePlayed_mac: entry.playtime_mac_forever,
      //  timePlayed_linux: entry.playtime_linux_forever,
      //  timePlayed_steamdeck: entry.playtime_deck_forever,
      //  timePlayed_disconnected: entry.playtime_disconnected,
      //};

      const data: Game = {
          id: uuidv4(),
          externalId: entry.appid,
          name: entry.name,
          storefrontId: Storefront.STEAM,
          gameStatusId: entry.playtime_forever > 0 ? 2 : 1,
          lastTimePlayed: entry.rtime_last_played,
          isInstalled: false,
          gameTimePlayedId: null
      };

      const dbGame = await GameQueries.createOrUpdateExternal(data.externalId!, data, Storefront.STEAM, data.gameStatusId)
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
