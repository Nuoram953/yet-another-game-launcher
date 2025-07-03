import axios from "axios";
import { getToken } from "./auth";
import * as configService from "@main/config/config.service";

export const BASE_URL = "https://api.igdb.com/v4/";

export const EXTERNAL_GAME_URL = BASE_URL + "external_games";
export const INVOLED_COMPANY_URL = BASE_URL + "involved_companies";
export const GAME_URL = BASE_URL + "games";

export const axiosInstance = axios.create();

export async function getAuthUrl(): Promise<string> {
  const clientId = (await configService.get("extension.igdb.clientId")) || process.env.IGDB_CLIENT_ID;
  const clientSecret = (await configService.get("extension.igdb.clientSecret")) || process.env.IGDB_CLIENT_SECRET;
  return `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
}

axiosInstance.interceptors.request.use(async (request) => {
  const token = await getToken();
  request.headers.Authorization = `Bearer ${token}`;
  request.headers.Accept = `application/json`;
  request.headers["Client-ID"] = (await configService.get("extension.igdb.clientId")) || process.env.IGDB_CLIENT_ID;
  return request;
});
