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
