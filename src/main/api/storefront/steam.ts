import axios, { AxiosResponse } from "axios";
import { app } from "electron";
import path from "path";
import fs from "fs";
import vdf from "vdf";
import { Storefront } from "../../constant";
import { Game, GameAchievement, GameConfigGamescope } from "@prisma/client";
import { createOrUpdateGame } from "../../service/game";
import acfParser from "steam-acf2json";
import queries from "../../dal/dal";
import _ from "lodash";
import { metadataManager } from "../../../main";
import { MEDIA_TYPE } from "../../../common/constant";
import { GameWithRelations } from "src/common/types";
const VDF = require("vdf-parser");
import { readVdf, writeVdf } from "steam-binary-vdf";

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
        externalId: entry.appid.toString(),
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
    return user[0];
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

      const files = await fs.promises.readdir(steamConfigDirectory);
      const appManifestFiles = files.filter((file) =>
        /^appmanifest_\d+\.acf$/.test(file),
      );

      for (const file of appManifestFiles) {
        let appId;
        const match = file.match(/^appmanifest_(\d+)\.acf$/);
        if (match) {
          appId = match[1];
        } else {
          throw new Error();
        }

        const game = await queries.Game.getGameByExtenalIdAndStorefront(
          appId,
          Storefront.STEAM,
        );

        if (!game) {
          continue;
        }
        await queries.Game.update(game.id, { isInstalled: true });

        const filePath = path.join(steamConfigDirectory, file);
        const appManifestFile = fs.readFileSync(filePath, "utf-8");
        const decode = acfParser.decode(appManifestFile);
        const gamePath = path.join(
          app.getPath("userData"),
          "../../.local/share/Steam/steamapps/common",
          decode.AppState.installdir,
        );

        await queries.Game.update(game.id, {
          size: decode.AppState.SizeOnDisk,
          location: gamePath,
          isInstalled: true,
        });
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async getUserAchievementsForGame(id:string) {
    const game = await queries.Game.getGameById(id);
    if (_.isNil(game)) {
      throw new Error("game not found");
    }

    if(!game.hasAchievements){
      return
    }

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

      const hasAchievements = Object.keys(response.data.game).length > 0
      await queries.Game.update(game.id, {hasAchievements:hasAchievements})

      if(!hasAchievements){
        return
      }

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
          MEDIA_TYPE.ACHIEVEMENT,
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

  async getAppInfoFile() {
    const steamConfigDirectory = path.join(
      app.getPath("userData"),
      `../../.steam/steam/appcache`,
    );

    const data = fs.readFileSync(
      `${steamConfigDirectory}/appinfo.vdf`,
    );

    const dataJson = readVdf(data,600);

    console.log(dataJson);
  }

  async updateLaunchOptions(
    game: GameWithRelations,
    gamescope: GameConfigGamescope,
  ) {
    try {
      const steamConfigDirectory = path.join(
        app.getPath("userData"),
        `../../.steam/steam/userdata`,
      );

      const data = await fs.promises.readFile(
        `${steamConfigDirectory}/${await this.steamId64ToSteamId3()}/config/localconfig.vdf`,
        "utf8",
      );

      const dataJson = await vdf.parse(data);

      const gameConfigSteam =
        dataJson.UserLocalConfigStore.Software.Valve.Steam.apps[
          game.externalId
        ];

      if (gameConfigSteam) {
        gameConfigSteam.LaunchOptions =
          'VKD3D_DISABLE_EXTENSIONS=VK_KHR_present_wait LD_PRELOAD="" gamescope -e -W 3840 -H 1600 -r 144 --force-grab-cursor -- gamemoderun %command%';

        const updatedVdfContent = VDF.stringify(dataJson);

        await fs.promises.writeFile(
          `${steamConfigDirectory}/${await this.steamId64ToSteamId3()}/config/localconfig.vdf`,
          updatedVdfContent,
          "utf8",
        );

        console.log("LaunchOptions updated successfully");
      } else {
        console.log("Game configuration not found.");
      }
    } catch (error) {
      console.log("Error updating LaunchOptions:", error);
      return [];
    }
  }

  async steamId64ToSteamId3(): Promise<string> {
    const steamId64BigInt = BigInt(await this.getSteamUserData());

    const baseOffset = 76561197960265728n;

    const steamId3Number = steamId64BigInt - baseOffset;

    return steamId3Number.toString();
  }
}

export default Steam;
