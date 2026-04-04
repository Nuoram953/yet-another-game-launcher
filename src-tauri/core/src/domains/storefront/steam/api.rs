use super::models::SteamOwnedGamesResponse;
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
