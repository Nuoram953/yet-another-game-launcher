import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { Storefront } from "../../constant";
import { Game, GameAchievement } from "@prisma/client";
import { createOrUpdateGame } from "../../service/game";
import * as GameQueries from "../../dal/game";
import acfParser from "steam-acf2json";
import { delay } from "../../utils/utils";
import queries from "../../dal/dal";
import { metadataManager } from "../../index";
import { IMAGE_TYPE } from "../../../common/constant";
import _ from "lodash";

class Steam {
  private steamid: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY;
  }

  async initialize(): Promise<void> {
    await this.getSteamUserData();
    await this.getOwnedGames();
    await this.getInstalledGames();
  }

  async parseResponse(response: AxiosResponse): Promise<void> {
    for (const entry of response.data.response.games) {
      const data: Partial<Game> = {
        externalId: entry.appid,
        name: entry.name,
        storefrontId: Storefront.STEAM,
        gameStatusId: entry.playtime_forever > 0 ? 2 : 1,
        lastTimePlayed: entry.rtime_last_played,
        isInstalled: false,
        timePlayed: entry.playtime_forever,
        timePlayedWindows: entry.playtime_windows_forever,
        timePlayedMac: entry.playtime_mac_forever,
        timePlayedLinux: entry.playtime_linux_forever,
        timePlayedSteamdeck: entry.playtime_deck_forever,
        timePlayedDisconnected: entry.playtime_disconnected,
      };

      await createOrUpdateGame(data, Storefront.STEAM);

      await delay(2000);
    }
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
    return user[0]
  }

  async getOwnedGames() {
    try {
      const response = await axios.get(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001",
        {
          params: {
            steamid: await this.getSteamUserData(),
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

  async getInstalledGames() {
    try {
      const steamConfigDirectory = path.join(
        app.getPath("userData"),
        "../../.steam/steam/steamapps",
      );
      const data = await fs.promises.readFile(
        `${steamConfigDirectory}/libraryfolders.vdf`,
        "utf8",
      );

      const dataJson = await vdf.parse(data);

      const appIds: number[] = Object.keys(dataJson.libraryfolders[0].apps)
        .map((key) => {
          const fileName = `/appmanifest_${key}.acf`;
          if (fs.existsSync(path.join(steamConfigDirectory, fileName))) {
            return Number(key);
          }
        })
        .filter((item) => item !== undefined) as number[];

      await GameQueries.updateIsInstalled(appIds, Storefront.STEAM, true);

      for (const appId of appIds) {
        const fileName = `/appmanifest_${appId}.acf`;
        const filePath = path.join(steamConfigDirectory, fileName);
        const file = fs.readFileSync(filePath, "utf-8");
        const decode = acfParser.decode(file);
        const gamePath = path.join(
          app.getPath("userData"),
          "../../.local/share/Steam/steamapps/common",
          decode.AppState.installdir,
        );
        await GameQueries.updateSizeAndLocation(
          appId,
          Storefront.STEAM,
          Number(decode.AppState.SizeOnDisk),
          gamePath,
        );
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async getUserAchievementsForGame(game: Game) {
    try {
      const response = await axios.get(
        "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001",
        {
          params: {
            steamid: await this.getSteamUserData(),
            key: this.apiKey,
            appid: game.externalId,
          },
        },
      );

      const achievements = response.data.playerstats.achievements;
      for (const achievement of achievements) {
        if (achievement.achieved == 1) {
          const data: Partial<GameAchievement> = {
            isUnlocked: achievement.achieved == 1,
            unlockedAt: achievement.unlocktime,
            externalId: achievement.apiname,
          };
          await queries.GameAchievements.setAchievementUnlocked(game.id, data);
        }
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getAchievementsForGame(game: Game) {
    try {
      const response = await axios.get(
        "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002",
        {
          params: {
            steamid: await this.getSteamUserData(),
            key: this.apiKey,
            appid: game.externalId,
          },
        },
      );

      const achievements = response.data.game.availableGameStats.achievements;

      for (const achievement of achievements) {
        const data: Partial<GameAchievement> = {
          description: achievement.description,
          externalId: achievement.name,
          isHidden: achievement.hidden == 1,
          name: achievement.displayName,
        };
        await queries.GameAchievements.findOrCreate(game.id, data);
        await metadataManager.downloadImage(
          IMAGE_TYPE.ACHIEVEMENT,
          game,
          achievement.icon,
          "jpg",
          achievement.name,
        );
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

export default Steam;
