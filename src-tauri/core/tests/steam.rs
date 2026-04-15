use mockito::Server;
use std::sync::OnceLock;
use tempfile::tempdir;
use tokio::sync::Mutex;
use yagl_core::domains::storefront::steam::{api, local::LocalSteamApps, service};

fn two_game_body() -> &'static str {
    r#"{
        "response": {
            "game_count": 2,
            "games": [
                {
                    "appid": 440001,
                    "name": "Team Fortress 2",
                    "playtime_forever": 120,
                    "rtime_last_played": 1700000000
                },
                {
                    "appid": 570001,
                    "name": "Dota 2",
                    "playtime_forever": 0,
                    "rtime_last_played": 0
                }
            ]
        }
    }"#
}

fn env_lock() -> &'static Mutex<()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(()))
}

fn create_fake_steam_root(primary_app_id: u32) -> tempfile::TempDir {
    let tmp = tempdir().unwrap();
    let steam_root = tmp.path();
    let steamapps = steam_root.join("steamapps");
    let common = steamapps.join("common");
    std::fs::create_dir_all(&common).unwrap();

    let manifest = format!(
        "\"AppState\"\n{{\n    \"appid\" \"{primary_app_id}\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"4\"\n    \"SizeOnDisk\" \"4242\"\n    \"BytesToDownload\" \"0\"\n    \"BytesDownloaded\" \"4242\"\n}}\n"
    );
    std::fs::write(
        steamapps.join(format!("appmanifest_{primary_app_id}.acf")),
        manifest,
    )
    .unwrap();
    std::fs::create_dir_all(common.join("Team Fortress 2")).unwrap();

    let libraryfolders = format!(
        "\"libraryfolders\"\n{{\n    \"0\"\n    {{\n        \"path\" \"{}\"\n        \"label\" \"\"\n        \"contentid\" \"1\"\n        \"totalsize\" \"0\"\n        \"apps\"\n        {{\n            \"{primary_app_id}\" \"4242\"\n        }}\n    }}\n}}\n",
        steam_root.display()
    );
    std::fs::write(steamapps.join("libraryfolders.vdf"), libraryfolders).unwrap();

    tmp
}

fn create_fake_steam_root_with_manifest(
    app_id: u32,
    manifest: &str,
    create_install_dir: bool,
) -> tempfile::TempDir {
    let tmp = tempdir().unwrap();
    let steam_root = tmp.path();
    let steamapps = steam_root.join("steamapps");
    let common = steamapps.join("common");
    std::fs::create_dir_all(&common).unwrap();
    std::fs::write(
        steamapps.join(format!("appmanifest_{app_id}.acf")),
        manifest,
    )
    .unwrap();
    if create_install_dir {
        std::fs::create_dir_all(common.join("Team Fortress 2")).unwrap();
    }

    let libraryfolders = format!(
        "\"libraryfolders\"\n{{\n    \"0\"\n    {{\n        \"path\" \"{}\"\n        \"label\" \"\"\n        \"contentid\" \"1\"\n        \"totalsize\" \"0\"\n        \"apps\"\n        {{\n            \"{app_id}\" \"4242\"\n        }}\n    }}\n}}\n",
        steam_root.display()
    );
    std::fs::write(steamapps.join("libraryfolders.vdf"), libraryfolders).unwrap();

    tmp
}

fn write_manifest(path: &std::path::Path, body: &str) {
    std::fs::write(path, body).unwrap();
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

async fn make_achievement_mocks(
    schema_status: usize,
    schema_body: &str,
    player_status: usize,
    player_body: &str,
) -> (mockito::ServerGuard, mockito::Mock, mockito::Mock) {
    let mut server = Server::new_async().await;
    let schema = server
        .mock("GET", "/ISteamUserStats/GetSchemaForGame/v0002")
        .match_query(mockito::Matcher::Any)
        .with_status(schema_status)
        .with_header("content-type", "application/json")
        .with_body(schema_body)
        .create_async()
        .await;
    let player = server
        .mock("GET", "/ISteamUserStats/GetPlayerAchievements/v0001")
        .match_query(mockito::Matcher::Any)
        .with_status(player_status)
        .with_header("content-type", "application/json")
        .with_body(player_body)
        .create_async()
        .await;
    (server, schema, player)
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
    assert_eq!(games[0].appid, 440001);
    assert_eq!(games[0].name.as_deref(), Some("Team Fortress 2"));
    assert_eq!(games[0].playtime_forever, Some(120));
    assert_eq!(games[1].appid, 570001);
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
    let _guard = env_lock().lock().await;
    let (server, mock) = make_mock(200, two_game_body()).await;
    std::env::set_var("STEAM_API_KEY", "test_key");
    std::env::remove_var("YAGL_STEAM_DIR");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    let games = result.expect("sync_library should succeed");
    assert_eq!(games.len(), 2);
    assert_eq!(games[0].external_id, "440001");
    assert_eq!(games[0].name, "Team Fortress 2");
    assert!(!games[0].is_installed);
    assert_eq!(games[1].external_id, "570001");
    assert_eq!(games[1].name, "Dota 2");
    assert!(!games[1].is_installed);
}

#[tokio::test]
async fn service_sync_library_filters_games_without_name() {
    let _guard = env_lock().lock().await;
    let body = r#"{
        "response": {
            "game_count": 2,
            "games": [
                { "appid": 440001, "name": "Team Fortress 2", "playtime_forever": 10, "rtime_last_played": 0 },
                { "appid": 999, "playtime_forever": 5, "rtime_last_played": 0 }
            ]
        }
    }"#;
    let (server, mock) = make_mock(200, body).await;
    std::env::set_var("STEAM_API_KEY", "test_key");
    std::env::remove_var("YAGL_STEAM_DIR");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    let games = result.expect("should succeed");
    assert_eq!(games.len(), 1, "game without a name should be filtered out");
    assert_eq!(games[0].external_id, "440001");
}

#[tokio::test]
async fn service_sync_library_returns_empty_vec_when_no_games() {
    let _guard = env_lock().lock().await;
    let (server, mock) = make_mock(200, r#"{"response": {}}"#).await;
    std::env::set_var("STEAM_API_KEY", "test_key");
    std::env::remove_var("YAGL_STEAM_DIR");

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    assert!(result.expect("should succeed").is_empty());
}

#[tokio::test]
async fn service_sync_library_errors_without_api_key() {
    let _guard = env_lock().lock().await;
    std::env::remove_var("STEAM_API_KEY");
    std::env::remove_var("YAGL_STEAM_DIR");

    let result = service::sync_library("76561198000000000", service::default_base_url()).await;

    assert!(
        matches!(result, Err(yagl_core::error::AppError::Steam(_))),
        "expected Steam error for missing API key"
    );
}

#[tokio::test]
async fn service_sync_library_reads_installed_state_from_local_steam_files() {
    let _guard = env_lock().lock().await;
    let steam_root = create_fake_steam_root(440001);
    let (server, mock) = make_mock(200, two_game_body()).await;
    std::env::set_var("STEAM_API_KEY", "test_key");
    std::env::set_var("YAGL_STEAM_DIR", steam_root.path());

    let result = service::sync_library("76561198000000000", &server.url()).await;

    mock.assert_async().await;
    let games = result.expect("sync_library should succeed");
    let installed = games
        .iter()
        .find(|game| game.external_id == "440001")
        .expect("expected Team Fortress 2 in response");

    assert!(installed.is_installed);
    assert!(installed
        .location
        .ends_with("steamapps/common/Team Fortress 2"));
    assert_eq!(installed.size, Some(4242));
    assert!(
        games.iter().any(|game| !game.is_installed),
        "expected at least one not-installed game"
    );
}

#[tokio::test]
async fn service_fetch_achievement_set_maps_schema_and_progress() {
    let _guard = env_lock().lock().await;
    let schema = r#"{
        "game": {
            "gameName": "Team Fortress 2",
            "gameVersion": "7",
            "availableGameStats": {
                "achievements": [
                    {
                        "name": "ACH_WIN_ONE_GAME",
                        "defaultvalue": 0,
                        "displayName": "Winner",
                        "hidden": 0,
                        "description": "Win one game",
                        "icon": "https://example.com/icon.png",
                        "icongray": "https://example.com/icon-gray.png"
                    }
                ]
            }
        }
    }"#;
    let player = r#"{
        "playerstats": {
            "steamID": "76561198000000000",
            "gameName": "Team Fortress 2",
            "achievements": [
                {
                    "apiname": "ACH_WIN_ONE_GAME",
                    "achieved": 1,
                    "unlocktime": 1700000000
                }
            ],
            "success": true
        }
    }"#;
    let (server, schema_mock, player_mock) = make_achievement_mocks(200, schema, 200, player).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::fetch_achievement_set("76561198000000000", "440", &server.url())
        .await
        .unwrap()
        .expect("expected achievement set");

    schema_mock.assert_async().await;
    player_mock.assert_async().await;
    assert_eq!(result.provider, "steam");
    assert_eq!(result.external_set_id, "440");
    assert_eq!(result.name, "Team Fortress 2");
    assert_eq!(result.version.as_deref(), Some("7"));
    assert_eq!(result.achievements.len(), 1);
    assert!(result.achievements[0].is_unlocked);
    assert_eq!(result.achievements[0].unlocked_at, Some(1700000000));
}

#[tokio::test]
async fn service_fetch_achievement_set_handles_unsuccessful_player_stats() {
    let _guard = env_lock().lock().await;
    let schema = r#"{
        "game": {
            "gameName": "Team Fortress 2",
            "gameVersion": "7",
            "availableGameStats": {
                "achievements": [
                    {
                        "name": "ACH_WIN_ONE_GAME",
                        "defaultvalue": 0,
                        "displayName": "Winner",
                        "hidden": 0,
                        "description": "Win one game",
                        "icon": "https://example.com/icon.png",
                        "icongray": "https://example.com/icon-gray.png"
                    }
                ]
            }
        }
    }"#;
    let player = r#"{
        "playerstats": {
            "gameName": "Team Fortress 2",
            "error": "profile is private",
            "success": false
        }
    }"#;
    let (server, schema_mock, player_mock) = make_achievement_mocks(200, schema, 200, player).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::fetch_achievement_set("76561198000000000", "440", &server.url())
        .await
        .unwrap()
        .expect("expected achievement set");

    schema_mock.assert_async().await;
    player_mock.assert_async().await;
    assert_eq!(
        result.description.as_deref(),
        Some("Steam player achievements: profile is private")
    );
    assert!(!result.achievements[0].is_unlocked);
    assert!(result.achievements[0].unlocked_at.is_none());
}

#[tokio::test]
async fn service_fetch_achievement_set_returns_none_when_schema_has_no_achievements() {
    let _guard = env_lock().lock().await;
    let schema = r#"{
        "game": {
            "gameName": "Half-Life",
            "gameVersion": "1",
            "availableGameStats": {}
        }
    }"#;
    let player = r#"{
        "playerstats": {
            "success": true
        }
    }"#;
    let (server, schema_mock, _player_mock) =
        make_achievement_mocks(200, schema, 200, player).await;
    std::env::set_var("STEAM_API_KEY", "test_key");

    let result = service::fetch_achievement_set("76561198000000000", "70", &server.url())
        .await
        .unwrap();

    schema_mock.assert_async().await;
    assert!(result.is_none());
}

#[tokio::test]
async fn local_app_status_does_not_treat_precreated_install_dir_as_complete() {
    let _guard = env_lock().lock().await;
    let steam_root = create_fake_steam_root_with_manifest(
        440001,
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"SizeOnDisk\" \"0\"\n}\n",
        true,
    );
    std::env::set_var("YAGL_STEAM_DIR", steam_root.path());

    let local_apps = LocalSteamApps::locate().expect("should locate fake steam dir");
    let status = local_apps
        .app_status(440001)
        .expect("app_status should succeed")
        .expect("app status should exist");

    assert!(!status.is_active);
    assert!(!status.is_installed);
}

#[tokio::test]
async fn local_app_status_marks_downloading_state_as_active() {
    let _guard = env_lock().lock().await;
    let steam_root = create_fake_steam_root_with_manifest(
        440001,
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"1048576\"\n    \"SizeOnDisk\" \"1024\"\n    \"BytesToDownload\" \"2048\"\n    \"BytesDownloaded\" \"512\"\n}\n",
        true,
    );
    std::env::set_var("YAGL_STEAM_DIR", steam_root.path());

    let local_apps = LocalSteamApps::locate().expect("should locate fake steam dir");
    let status = local_apps
        .app_status(440001)
        .expect("app_status should succeed")
        .expect("app status should exist");

    assert!(status.is_active);
    assert!(!status.is_installed);
}

#[tokio::test]
async fn local_app_status_prefers_live_tmp_manifest_when_present() {
    let _guard = env_lock().lock().await;
    let steam_root = create_fake_steam_root_with_manifest(
        440001,
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"1026\"\n    \"BytesToDownload\" \"2048\"\n    \"BytesDownloaded\" \"0\"\n}\n",
        true,
    );
    let steamapps = steam_root.path().join("steamapps");
    write_manifest(
        &steamapps.join("appmanifest_440001.acf.live.tmp"),
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"3145984\"\n    \"BytesToDownload\" \"1024\"\n    \"BytesDownloaded\" \"512\"\n    \"BytesToStage\" \"2048\"\n    \"BytesStaged\" \"1024\"\n    \"StagingSize\" \"3072\"\n}\n",
    );
    std::env::set_var("YAGL_STEAM_DIR", steam_root.path());

    let local_apps = LocalSteamApps::locate().expect("should locate fake steam dir");
    let status = local_apps
        .app_status(440001)
        .expect("app_status should succeed")
        .expect("app status should exist");

    assert_eq!(status.bytes_downloaded, Some(512));
    assert_eq!(status.bytes_staged, Some(1024));
    assert_eq!(status.bytes_to_stage, Some(2048));
}

#[tokio::test]
async fn install_progress_maps_live_steam_status_to_generic_progress() {
    let _guard = env_lock().lock().await;
    let steam_root = create_fake_steam_root_with_manifest(
        440001,
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"1026\"\n    \"BytesToDownload\" \"2048\"\n    \"BytesDownloaded\" \"0\"\n}\n",
        true,
    );
    let steamapps = steam_root.path().join("steamapps");
    write_manifest(
        &steamapps.join("appmanifest_440001.acf.live.tmp"),
        "\"AppState\"\n{\n    \"appid\" \"440001\"\n    \"name\" \"Team Fortress 2\"\n    \"installdir\" \"Team Fortress 2\"\n    \"StateFlags\" \"3145984\"\n    \"BytesToDownload\" \"1024\"\n    \"BytesDownloaded\" \"512\"\n    \"BytesToStage\" \"2048\"\n    \"BytesStaged\" \"1024\"\n    \"StagingSize\" \"3072\"\n}\n",
    );
    std::env::set_var("YAGL_STEAM_DIR", steam_root.path());

    let progress = service::install_progress("440001")
        .expect("install_progress should succeed")
        .expect("install progress should exist");

    assert_eq!(progress.downloaded_bytes, Some(1024));
    assert_eq!(progress.total_bytes, Some(3072));
    assert!(progress.is_active);
    assert!(!progress.is_installed);
}
