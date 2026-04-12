mod common;

use std::{fs, process::Command};

use cli_lib::commands::launch;
use common::{strip_ansi, unique_path};
use yagl_core::{
    db::DbPool,
    domains::game::{models::NewGameLaunch, repository},
    testing::{
        db::test_db,
        fixtures::{insert_game_launch, insert_game_library_entry},
    },
};

async fn setup_launch_with_activity(pool: &DbPool) -> String {
    repository::insert_game(pool, "game-1", "Half-Life 2", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(pool, "entry-1", "game-1", "220").await;
    let launch = insert_game_launch(pool, "launch-1", &entry.id, Some("/nonexistent/bin")).await;
    repository::insert_activity(pool, Some(&launch.id), 0, 1, 1)
        .await
        .unwrap();
    launch.id
}

#[tokio::test]
async fn launch_last_with_no_history_returns_error() {
    let pool = test_db().await;

    let result = launch::handle(&pool, None, None, true).await;

    assert!(result.is_err());
    assert!(
        result.unwrap_err().to_string().contains("no launch found"),
        "expected 'no launch found' error"
    );
}

#[tokio::test]
async fn launch_last_resolves_launch_from_activity() {
    let pool = test_db().await;
    setup_launch_with_activity(&pool).await;

    let result = launch::handle(&pool, None, None, true).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        !msg.contains("no launch found"),
        "resolution should have succeeded, got: {msg}"
    );
}

#[tokio::test]
async fn launch_last_is_skipped_when_launch_id_is_provided() {
    let pool = test_db().await;

    let result = launch::handle(&pool, None, Some("nonexistent-id".into()), true).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("nonexistent-id"),
        "expected launch_id error (not launch_last), got: {msg}"
    );
}

#[tokio::test]
async fn launch_id_not_found_returns_error_with_id() {
    let pool = test_db().await;

    let result = launch::handle(&pool, None, Some("cfg-xyz".into()), false).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("cfg-xyz"),
        "expected launch id in error, got: {msg}"
    );
}

#[tokio::test]
async fn launch_id_resolves_and_reaches_launch_stage() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    insert_game_launch(&pool, "launch-1", &entry.id, Some("/nonexistent/bin")).await;

    let result = launch::handle(&pool, None, Some("launch-1".into()), false).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        !msg.contains("launch config 'launch-1' not found"),
        "resolution should have succeeded, got: {msg}"
    );
}

#[tokio::test]
async fn game_id_not_found_returns_error_with_id() {
    let pool = test_db().await;

    let result = launch::handle(&pool, Some("ghost-game".into()), None, false).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("ghost-game"),
        "expected game id in error, got: {msg}"
    );
}

#[tokio::test]
async fn game_id_with_no_default_launch_returns_error() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();

    let result = launch::handle(&pool, Some("game-1".into()), None, false).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("game-1"),
        "expected game id in error, got: {msg}"
    );
}

#[tokio::test]
async fn game_id_resolves_default_launch_and_reaches_launch_stage() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    insert_game_launch(&pool, "launch-1", &entry.id, Some("/nonexistent/bin")).await;

    let result = launch::handle(&pool, Some("game-1".into()), None, false).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        !msg.contains("no launch config found"),
        "resolution should have succeeded, got: {msg}"
    );
}

#[tokio::test]
async fn launch_command_prints_launch_summary_and_session_duration() {
    let db_path = unique_path("yagl-launch-command.db");
    let pool = yagl_core::db::connect(db_path.to_str().unwrap())
        .await
        .unwrap();

    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-1".to_string(),
            game_library_entry_id: entry.id,
            name: "Steam".to_string(),
            executable: Some("/bin/sh".to_string()),
            args: Some("-c 'exit 0'".to_string()),
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "launch", "game-1"])
        .output()
        .unwrap();

    fs::remove_file(&db_path).unwrap();

    assert!(
        output.status.success(),
        "expected success, stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));

    assert!(stdout.contains("Launching Portal"), "stdout was: {stdout}");
    assert!(
        stdout.contains("Launch        Steam"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("Storefront    Steam"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("Session recorded"), "stdout was: {stdout}");
    assert!(stdout.contains("Duration"), "stdout was: {stdout}");
}
