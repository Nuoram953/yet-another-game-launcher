import axios from "axios";
import { getToken } from "./auth";

export const BASE_URL = "https://api.igdb.com/v4/";
export const AUTH_URL = `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`;

export const EXTERNAL_GAME_URL = BASE_URL + "external_games";
export const INVOLED_COMPANY_URL = BASE_URL + "involved_companies";
export const GAME_URL = BASE_URL + "games";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(async (request) => {
  const token = await getToken();
  request.headers.Authorization = `Bearer ${token}`;
  request.headers.Accept = `application/json`;
  request.headers["Client-ID"] = process.env.IGDB_CLIENT_ID;
  return request;
});
