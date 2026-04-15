use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct SteamOwnedGamesResponse {
    pub response: OwnedGamesPayload,
}

#[derive(Debug, Deserialize)]
pub struct OwnedGamesPayload {
    pub game_count: Option<u32>,
    pub games: Option<Vec<SteamApp>>,
}

#[derive(Debug, Deserialize)]
pub struct SteamApp {
    pub appid: u64,
    pub name: Option<String>,
    pub playtime_forever: Option<u64>,
    pub rtime_last_played: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct SteamSchemaForGameResponse {
    pub game: SchemaForGamePayload,
}

#[derive(Debug, Deserialize)]
pub struct SteamPlayerAchievementsResponse {
    pub playerstats: PlayerAchievementsPayload,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlayerAchievementsPayload {
    pub steam_id: Option<String>,
    pub game_name: Option<String>,
    pub achievements: Option<Vec<PlayerAchievement>>,
    pub error: Option<String>,
    pub success: bool,
}

#[derive(Debug, Deserialize)]
pub struct PlayerAchievement {
    #[serde(rename = "apiname")]
    pub api_name: String,
    pub achieved: u32,
    #[serde(rename = "unlocktime")]
    pub unlock_time: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaForGamePayload {
    pub game_name: Option<String>,
    pub game_version: Option<String>,
    pub available_game_stats: Option<SchemaForGameStats>,
}

#[derive(Debug, Deserialize)]
pub struct SchemaForGameStats {
    pub achievements: Option<Vec<SchemaForGameAchievement>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaForGameAchievement {
    pub name: String,
    #[serde(rename = "defaultvalue")]
    pub default_value: u32,
    pub display_name: String,
    pub hidden: u32,
    pub description: Option<String>,
    pub icon: String,
    #[serde(rename = "icongray")]
    pub icon_gray: String,
}
