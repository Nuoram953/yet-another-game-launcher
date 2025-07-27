import {
  GET_APP_REVIEWS,
  GET_GLOBAL_ACHIEVEMENT_PERCENTAGES_FOR_APP,
  GET_OWNED_GAMES_URL,
  GET_PLAYER_ACHIEVEMENTS_URL,
  GET_PLAYER_SUMMARIES,
  GET_SCHEMA_FOR_GAME_URL,
  getApiKey,
} from "./config";
import { getSteamUserId } from "./utils";
import {
  GetAppReviewsResponse,
  GetGlobalAchievementPercentagesForAppResponse,
  GetOwnedGamesResponse,
  GetPlayerAchievementsResponse,
  GetPlayerSummariesResponse,
  GetSchemaForGameResponse,
} from "./types";
import axios from "@common/axiosConfig";

export const getOwnedGames = async () => {
  return await axios.get<GetOwnedGamesResponse>(GET_OWNED_GAMES_URL, {
    params: {
      steamid: await getSteamUserId(),
      key: await getApiKey(),
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
      key: await getApiKey(),
      appid: appId,
    },
  });
};

export const getPlayerAchievements = async (appId: string) => {
  return await axios.get<GetPlayerAchievementsResponse>(GET_PLAYER_ACHIEVEMENTS_URL, {
    params: {
      steamid: await getSteamUserId(),
      key: await getApiKey(),
      appid: appId,
    },
  });
};

export const getPlayerSummaries = async (steamIds: string[]) => {
  return await axios.get<GetPlayerSummariesResponse>(GET_PLAYER_SUMMARIES, {
    params: {
      steamids: steamIds.join(","),
      key: await getApiKey(),
    },
  });
};

export const getAppReviews = async (appId: string) => {
  return await axios.get<GetAppReviewsResponse>(GET_APP_REVIEWS.replace(":appId", appId), {
    params: {
      cursor: "*",
      json: 1,
      num_per_page: 15,
    },
  });
};

export const getGlobalAchievementPercentagesForApp = async (appId: string) => {
  return await axios.get<GetGlobalAchievementPercentagesForAppResponse>(GET_GLOBAL_ACHIEVEMENT_PERCENTAGES_FOR_APP, {
    params: {
      format: "json",
      gameid: appId,
    },
  });
};
