use mockito::Server;
use yagl_core::domains::storefront::steam::{api, service};

fn two_game_body() -> &'static str {
    r#"{
        "response": {
            "game_count": 2,
            "games": [
                {
                    "appid": 440,
                    "name": "Team Fortress 2",
                    "playtime_forever": 120,
                    "rtime_last_played": 1700000000
                },
                {
                    "appid": 570,
                    "name": "Dota 2",
                    "playtime_forever": 0,
                    "rtime_last_played": 0
                }
            ]
        }
    }"#
}

async fn make_mock(status: usize, body: &str) -> (mockito::ServerGuard, mockito::Mock) {
    let mut server = Server::new_async().await;
    let mock = server
        .mock("GET", "/IPlayerService/GetOwnedGames/v1/")
        .match_query(mockito::Matcher::Any)
        .with_status(status)
        .with_header("content-type", "application/json")
        .with_body(body)
        .create_async()
        .await;
    (server, mock)
}

#[tokio::test]
async fn api_returns_games_on_success() {
    let (server, mock) = make_mock(200, two_game_body()).await;

    let result = api::get_owned_games(&server.url(), "test_key", "76561198000000000").await;

    mock.assert_async().await;
    let payload = result.expect("should succeed").response;
    assert_eq!(payload.game_count, Some(2));
    let games = payload.games.expect("games list should be present");
    assert_eq!(games.len(), 2);
    assert_eq!(games[0].appid, 440);
    assert_eq!(games[0].name.as_deref(), Some("Team Fortress 2"));
    assert_eq!(games[0].playtime_forever, Some(120));
    assert_eq!(games[1].appid, 570);
    assert_eq!(games[1].name.as_deref(), Some("Dota 2"));
}

#[tokio::test]
async fn api_handles_empty_library() {
    let (server, mock) = make_mock(200, r#"{"response": {}}"#).await;

    let result = api::get_owned_games(&server.url(), "test_key", "76561198000000000").await;

    mock.assert_async().await;
    let payload = result.expect("should succeed").response;
    assert!(payload.game_count.is_none());
    assert!(payload.games.is_none());
}

#[tokio::test]
async fn api_returns_steam_error_on_non_2xx() {
    let (server, mock) = make_mock(403, "Forbidden").await;

    let result = api::get_owned_games(&server.url(), "bad_key", "76561198000000000").await;

    mock.assert_async().await;
    assert!(
        matches!(result, Err(yagl_core::error::AppError::Steam(_))),
        "expected Steam error, got {result:?}"
    );
}

#[tokio::test]
async fn api_returns_http_error_on_malformed_json() {
    let (server, mock) = make_mock(200, "not valid json").await;

    let result = api::get_owned_games(&server.url(), "test_key", "76561198000000000").await;

    mock.assert_async().await;
    assert!(
        matches!(result, Err(yagl_core::error::AppError::Http(_))),
        "expected Http error, got {result:?}"
    );
}

#[tokio::test]
async fn service_sync_library_maps_games_correctly() {
    let (server, mock) = make_mock(200, two_game_body()).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    let games = result.expect("sync_library should succeed");
    assert_eq!(games.len(), 2);
    assert_eq!(games[0].external_id, "440");
    assert_eq!(games[0].name, "Team Fortress 2");
    assert_eq!(games[1].external_id, "570");
    assert_eq!(games[1].name, "Dota 2");
}

#[tokio::test]
async fn service_sync_library_filters_games_without_name() {
    let body = r#"{
        "response": {
            "game_count": 2,
            "games": [
                { "appid": 440, "name": "Team Fortress 2", "playtime_forever": 10, "rtime_last_played": 0 },
                { "appid": 999, "playtime_forever": 5, "rtime_last_played": 0 }
            ]
        }
    }"#;
    let (server, mock) = make_mock(200, body).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    let games = result.expect("should succeed");
    assert_eq!(games.len(), 1, "game without a name should be filtered out");
    assert_eq!(games[0].external_id, "440");
}

#[tokio::test]
async fn service_sync_library_returns_empty_vec_when_no_games() {
    let (server, mock) = make_mock(200, r#"{"response": {}}"#).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    assert!(result.expect("should succeed").is_empty());
}

#[tokio::test]
async fn service_sync_library_errors_without_api_key() {
    std::env::remove_var("STEAM_API_KEY");

    let result = service::sync_library("76561198000000000", service::default_base_url()).await;

    assert!(
        matches!(result, Err(yagl_core::error::AppError::Steam(_))),
        "expected Steam error for missing API key"
    );
}
