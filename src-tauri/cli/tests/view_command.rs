use std::{
    fs,
    path::PathBuf,
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

use cli_lib::commands::view;
use yagl_core::{
    config::Config,
    db::connect,
    domains::game::{
        models::{NewGameLaunch, UpdateGame, UpdateGameLibraryEntry},
        repository,
    },
    testing::{db::test_db, fixtures::insert_game_library_entry},
};

fn temp_db_path() -> PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("yagl-view-command-{unique}.db"))
}

fn strip_ansi(value: &str) -> String {
    let mut cleaned = String::new();
    let mut chars = value.chars().peekable();

    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            if chars.next_if_eq(&'[').is_some() {
                for next in chars.by_ref() {
                    if ('@'..='~').contains(&next) {
                        break;
                    }
                }
            }
            continue;
        }

        cleaned.push(ch);
    }

    cleaned
}

#[tokio::test]
async fn game_id_not_found_returns_error_with_id() {
    let pool = test_db().await;
    let config = Config::default();

    let result = view::handle(&pool, Some("ghost-game".into()), &config).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("ghost-game"),
        "expected game id in error, got: {msg}"
    );
}

#[tokio::test]
async fn view_renders_game_details_to_stdout() {
    let db_path = temp_db_path();
    let pool = connect(db_path.to_str().unwrap()).await.unwrap();

    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    repository::update_game(
        &pool,
        "game-1",
        &UpdateGame {
            is_favorite: Some(true),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    repository::update_status(&pool, "game-1", 2).await.unwrap();

    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "steam-1").await;
    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(true),
            location: Some("/games/balatro".to_string()),
            size: Some(1_610_612_736),
            time_played: Some(125),
            last_played_at: Some(1_700_000_000),
        },
    )
    .await
    .unwrap();

    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-1".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "DirectX".to_string(),
            executable: Some("balatro.exe".to_string()),
            args: None,
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-2".to_string(),
            game_library_entry_id: entry.id,
            name: "Vulkan".to_string(),
            executable: Some("balatro-vulkan.exe".to_string()),
            args: None,
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();
    repository::insert_activity(&pool, Some("launch-1"), 1_700_000_000, 1_700_000_900, 900)
        .await
        .unwrap();
    repository::insert_activity(&pool, Some("launch-1"), 1_699_999_000, 1_699_999_600, 600)
        .await
        .unwrap();

    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "view", "game-1"])
        .output()
        .unwrap();

    fs::remove_file(&db_path).unwrap();

    assert!(
        output.status.success(),
        "expected success, stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));

    assert!(stdout.contains("Balatro ★"), "stdout was: {stdout}");
    assert!(stdout.contains("Playing"), "stdout was: {stdout}");
    assert!(stdout.contains("Steam"), "stdout was: {stdout}");
    assert!(stdout.contains("Installed     Yes"), "stdout was: {stdout}");
    assert!(
        stdout.contains("Location      /games/balatro"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("Size          1.50 GB"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("Playtime      2h 5m"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("Last Played   2023-11-14 22:13"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("Launches:"), "stdout was: {stdout}");
    assert!(
        stdout.contains("DirectX  default  25m"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("Vulkan  —"), "stdout was: {stdout}");
    assert!(
        stdout.contains("2023-11-14  22:13 – 22:28  15m"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("2023-11-14  21:56 – 22:06  10m"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("No sessions recorded."),
        "stdout was: {stdout}"
    );
}
