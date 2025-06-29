import axios from "axios";
import * as configService from "@main/config/config.service";

export const BASE_URL = "https://www.steamgriddb.com/api/v2/";
export const GET_GAME_BY_EXTERNAL_ID = BASE_URL + "games/";
export const SEARCH_URL = BASE_URL + "search/autocomplete/";
export const GRIDS_URL = BASE_URL + "grids/game/";
export const HEROES_URL = BASE_URL + "heroes/game/";
export const ICONS_URL = BASE_URL + "icons/game/";
export const LOGOS_URL = BASE_URL + "logos/game/";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (request) => {
  request.headers.Authorization = `Bearer ${(await configService.get("extension.steamGridDb.enable")) || process.env.STEAM_GRID_DB_API_KEY}`;
  request.headers.Accept = `application/json`;
  return request;
});
