import * as ConfigService from "@main/config/config.service";
import * as SteamUtil from "@main/storefront/steam/utils";
import _ from "lodash";

export const BASE_URL = "https://api.steampowered.com/";

export const GET_OWNED_GAMES_URL = BASE_URL + "IPlayerService/GetOwnedGames/v0001";
export const GET_PLAYER_ACHIEVEMENTS_URL = BASE_URL + "ISteamUserStats/GetPlayerAchievements/v0001";
export const GET_SCHEMA_FOR_GAME_URL = BASE_URL + "ISteamUserStats/GetSchemaForGame/v0002";

export let steamInstallationPath: string | null = null;

export const getDefaultSteamPath = async (): Promise<string> => {
  if (_.isNil(steamInstallationPath)) {
    steamInstallationPath =
      (await ConfigService.get("store.steam.isntallationPath")) || (await SteamUtil.getDefaultSteamPath());
  }
  return steamInstallationPath;
};

export const getApiKey = async () => {
  return (await ConfigService.get("store.steam.apiKey")) || process.env.STEAM_API_KEY;
};
