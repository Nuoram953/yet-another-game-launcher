export const BASE_URL = "https://api.steampowered.com/";
export const STEAM_API_KEY = process.env.STEAM_API_KEY;

export const GET_OWNED_GAMES_URL = BASE_URL + "IPlayerService/GetOwnedGames/v0001";
export const GET_PLAYER_ACHIEVEMENTS_URL = BASE_URL + "ISteamUserStats/GetPlayerAchievements/v0001";
export const GET_SCHEMA_FOR_GAME_URL = BASE_URL + "ISteamUserStats/GetSchemaForGame/v0002";
