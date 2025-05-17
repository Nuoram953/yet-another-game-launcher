import { createOrUpdateGame } from "@main/game/game.service";
import { Game, GameAchievement } from "@prisma/client";
import { GameStatus, MEDIA_TYPE, Storefront } from "@common/constant";
import { getDefaultSteamPath } from "./utils";
import { join } from "path";
import fs from "fs";
import queries from "@main/dal/dal";
import * as SteamEndpoints from "./endpoints";
import * as MetadataService from "@main/metadata/index";

//@ts-ignore-error - Missing type definitions
import acfParser from "steam-acf2json";
import { app } from "electron";
import _ from "lodash";
import logger, { LogTag } from "@main/logger";

export const refresh = async () => {
  const res = await SteamEndpoints.getOwnedGames();
  if (_.isNil(res.data.response)) {
    logger.warn(
      LogTag.STORE,
      {
        store: "Steam",
      },
      "Failed to get owned games",
    );
    return;
  }

  for (const entry of res.data?.response.games) {
    const { size, location, isInstalled } = await getInstalledGameDetail(entry.appid.toString());
    const data: Partial<Game> = {
      externalId: entry.appid.toString(),
      name: entry.name,
      storefrontId: Storefront.STEAM,
      gameStatusId: entry.playtime_forever > 0 ? GameStatus.PLAYED : GameStatus.UNPLAYED,
      lastTimePlayed: entry.rtime_last_played,
      timePlayed: entry.playtime_forever,
      timePlayedWindows: entry.playtime_windows_forever,
      timePlayedMac: entry.playtime_mac_forever,
      timePlayedLinux: entry.playtime_linux_forever,
      timePlayedSteamdeck: entry.playtime_deck_forever,
      timePlayedDisconnected: entry.playtime_disconnected,
      size,
      location,
      isInstalled,
    };

    await createOrUpdateGame(data, Storefront.STEAM);
  }
};

export const getInstalledGameDetail = async (appId: string): Promise<Partial<Game>> => {
  const steamDir = join(getDefaultSteamPath(), "steamapps");
  const manifestFile = `appmanifest_${appId}.acf`;
  const file = join(steamDir, manifestFile);

  if (!fs.existsSync(file)) {
    return { isInstalled: false };
  }

  const appManifestFile = fs.readFileSync(file, "utf-8");
  const decode = acfParser.decode(appManifestFile);
  const gamePath = join(
    app.getPath("userData"),
    "../../.local/share/Steam/steamapps/common",
    decode.AppState.installdir,
  );

  return {
    size: decode.AppState.SizeOnDisk,
    location: gamePath,
    isInstalled: true,
  };
};

export const getGameAchievements = async (game: Game) => {
  if (game.hasAchievements) {
    return;
  }
  const res = await SteamEndpoints.getSchemaForGame(game.externalId);

  const hasAchievements = Object.keys(res.data.game).length > 0;
  await queries.Game.update(game.id, { hasAchievements: hasAchievements });

  if (!hasAchievements) {
    return;
  }

  const achievements = res.data.game.availableGameStats.achievements;
  for (const achievement of achievements) {
    const data: Partial<GameAchievement> = {
      description: achievement.description,
      externalId: achievement.name,
      isHidden: achievement.hidden == 1,
      name: achievement.displayName,
    };

    await queries.GameAchievements.findOrCreate(game.id, data);
    await MetadataService.downloadImage(MEDIA_TYPE.ACHIEVEMENT, game, achievement.icon, "jpg", achievement.name);
  }
};

export const getPlayerAchievements = async (game: Game) => {
  if (!game.hasAchievements) {
    return;
  }

  const res = await SteamEndpoints.getPlayerAchievements(game.externalId);

  const achievements = res.data.playerstats.achievements;
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
};
