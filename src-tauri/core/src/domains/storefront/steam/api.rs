use super::models::{
    SteamOwnedGamesResponse, SteamPlayerAchievementsResponse, SteamSchemaForGameResponse,
};
use crate::error::AppError;
use serde::Serialize;

#[derive(Serialize)]
struct GetOwnedGamesParams<'a> {
    key: &'a str,
    steamid: &'a str,
    include_appinfo: bool,
    include_played_free_games: bool,
}

pub async fn get_owned_games(
    base_url: &str,
    api_key: &str,
    steam_id: &str,
) -> Result<SteamOwnedGamesResponse, AppError> {
    let params = GetOwnedGamesParams {
        key: api_key,
        steamid: steam_id,
        include_appinfo: true,
        include_played_free_games: false,
    };

    let response = reqwest::Client::new()
        .get(format!("{base_url}/IPlayerService/GetOwnedGames/v1/"))
        .query(&params)
        .send()
        .await
        .map_err(|e| AppError::Http(e.to_string()))?;

    if !response.status().is_success() {
        return Err(AppError::Steam(format!(
            "GetOwnedGames failed: {}",
            response.status()
        )));
    }

    response
        .json::<SteamOwnedGamesResponse>()
        .await
        .map_err(|e| AppError::Http(e.to_string()))
}

#[derive(Serialize)]
struct GetSchemaForGameParams<'a> {
    key: &'a str,
    steamid: &'a str,
    appid: &'a str,
}

pub async fn get_schema_for_game(
    base_url: &str,
    api_key: &str,
    steam_id: &str,
    app_id: &str,
) -> Result<SteamSchemaForGameResponse, AppError> {
    let params = GetSchemaForGameParams {
        key: api_key,
        steamid: steam_id,
        appid: app_id,
    };

    let response = reqwest::Client::new()
        .get(format!("{base_url}/ISteamUserStats/GetSchemaForGame/v0002"))
        .query(&params)
        .send()
        .await
        .map_err(|e| AppError::Http(e.to_string()))?;

    if !response.status().is_success() {
        return Err(AppError::Steam(format!(
            "GetSchemaForGame failed: {}",
            response.status()
        )));
    }

    response
        .json::<SteamSchemaForGameResponse>()
        .await
        .map_err(|e| AppError::Http(e.to_string()))
}

#[derive(Serialize)]
struct GetPlayerAchievementsParams<'a> {
    key: &'a str,
    steamid: &'a str,
    appid: &'a str,
}

pub async fn get_player_achievements(
    base_url: &str,
    api_key: &str,
    steam_id: &str,
    app_id: &str,
) -> Result<SteamPlayerAchievementsResponse, AppError> {
    let params = GetPlayerAchievementsParams {
        key: api_key,
        steamid: steam_id,
        appid: app_id,
    };

    let response = reqwest::Client::new()
        .get(format!(
            "{base_url}/ISteamUserStats/GetPlayerAchievements/v0001"
        ))
        .query(&params)
        .send()
        .await
        .map_err(|e| AppError::Http(e.to_string()))?;

    if !response.status().is_success() {
        return Err(AppError::Steam(format!(
            "GetPlayerAchievements failed: {}",
            response.status()
        )));
    }

    response
        .json::<SteamPlayerAchievementsResponse>()
        .await
        .map_err(|e| AppError::Http(e.to_string()))
}
