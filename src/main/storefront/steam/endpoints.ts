import { GET_OWNED_GAMES_URL, GET_PLAYER_ACHIEVEMENTS_URL, GET_SCHEMA_FOR_GAME_URL, STEAM_API_KEY } from "./config";
import { getSteamUserId } from "./utils";
import { GetOwnedGamesResponse, GetPlayerAchievementsResponse, GetSchemaForGameResponse } from "./types";
import axios from "@common/axiosConfig";

export const getOwnedGames = async () => {
  return await axios.get<GetOwnedGamesResponse>(GET_OWNED_GAMES_URL, {
    params: {
      steamid: await getSteamUserId(),
      key: STEAM_API_KEY,
      format: "json",
      include_appinfo: 1,
    },
    validateStatus(status) {
      return status >= 200 || status <= 400 || status === 429;
    },
  });
};

export const getSchemaForGame = async (appId: string) => {
  return await axios.get<GetSchemaForGameResponse>(GET_SCHEMA_FOR_GAME_URL, {
    params: {
      steamid: await getSteamUserId(),
      key: STEAM_API_KEY,
      appid: appId,
    },
  });
};

export const getPlayerAchievements = async (appId: string) => {
  return await axios.get<GetPlayerAchievementsResponse>(GET_PLAYER_ACHIEVEMENTS_URL, {
    params: {
      steamid: await getSteamUserId(),
      key: STEAM_API_KEY,
      appid: appId,
    },
  });
};
