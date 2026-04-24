mod common;

use std::{fs, process::Command};

use common::{strip_ansi, unique_path};

use cli_lib::commands::view;
use yagl_core::{
    config::Config,
    db::connect,
    domains::achievement::{
        models::{GetGameAchievementSetsPayload, ImportedAchievement, ImportedAchievementSet},
        service as achievement_service,
    },
    domains::game::{
        models::{NewGameLaunch, UpdateGame, UpdateGameLibraryEntry},
        repository,
    },
    testing::{db::test_db, fixtures::insert_game_library_entry},
};

#[tokio::test]
async fn game_id_not_found_returns_error_with_id() {
    let pool = test_db().await;
    let config = Config::default();

    let result = view::handle(&pool, Some("ghost-game".into()), false, &config).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("ghost-game"),
        "expected game id in error, got: {msg}"
    );
}

#[tokio::test]
async fn view_renders_game_details_to_stdout() {
    let db_path = unique_path("yagl-view-command.db");
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
            location: Some(Some("/games/balatro".to_string())),
            size: Some(Some(1_610_612_736)),
            time_played: Some(125),
            last_played_at: Some(Some(1_700_000_000)),
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
            game_library_entry_id: entry.id.clone(),
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
    achievement_service::sync_imported_set(
        &pool,
        "game-1",
        &entry,
        imported_set(
            "Steam achievements",
            vec![
                imported_achievement("ACH_WIN_ONE_GAME", "Winner", 0, true, Some(1_700_000_000)),
                imported_achievement("ACH_WIN_TEN_GAMES", "Veteran", 1, false, None),
            ],
        ),
    )
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
    assert!(stdout.contains("Launches"), "stdout was: {stdout}");
    assert!(
        stdout.contains("default DirectX  25m"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("launch Vulkan  —"), "stdout was: {stdout}");
    assert!(!stdout.contains("22:13 – 22:28"), "stdout was: {stdout}");
    assert!(!stdout.contains("22:06"), "stdout was: {stdout}");
    assert!(
        !stdout.contains("No sessions recorded."),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("Achievements"), "stdout was: {stdout}");
    assert!(
        stdout.contains("Progress      1/2 unlocked"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("Sets          1"), "stdout was: {stdout}");
    assert!(
        stdout.contains("Steam achievements  1/2"),
        "stdout was: {stdout}"
    );
    assert!(!stdout.contains("Winner"), "stdout was: {stdout}");
    assert!(!stdout.contains("Veteran"), "stdout was: {stdout}");
}

#[tokio::test]
async fn view_with_achievements_flag_renders_full_achievement_list() {
    let db_path = unique_path("yagl-view-command-achievements.db");
    let pool = connect(db_path.to_str().unwrap()).await.unwrap();

    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "steam-1").await;

    achievement_service::sync_imported_set(
        &pool,
        "game-1",
        &entry,
        imported_set(
            "Steam achievements",
            vec![
                imported_achievement("ACH_WIN_ONE_GAME", "Winner", 0, true, Some(1_700_000_000)),
                imported_achievement("ACH_WIN_TEN_GAMES", "Veteran", 1, false, None),
            ],
        ),
    )
    .await
    .unwrap();

    let achievements = achievement_service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: "game-1".to_string(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();
    assert_eq!(achievements.sets.len(), 1);

    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args([
            "--db",
            db_path.to_str().unwrap(),
            "view",
            "game-1",
            "--achievements",
        ])
        .output()
        .unwrap();

    fs::remove_file(&db_path).unwrap();

    assert!(
        output.status.success(),
        "expected success, stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));

    assert!(stdout.contains("Achievements"), "stdout was: {stdout}");
    assert!(
        stdout.contains("Steam achievements  1/2"),
        "stdout was: {stdout}"
    );
    assert!(
        stdout.contains("✓ Winner  2023-11-14 22:13"),
        "stdout was: {stdout}"
    );
    assert!(stdout.contains("○ Veteran"), "stdout was: {stdout}");
}

fn imported_set(name: &str, achievements: Vec<ImportedAchievement>) -> ImportedAchievementSet {
    ImportedAchievementSet {
        game_launch_id: None,
        storefront_id: Some(1),
        provider: "steam".to_string(),
        external_set_id: "440".to_string(),
        external_game_id: "440".to_string(),
        variant: String::new(),
        name: name.to_string(),
        description: None,
        version: Some("1".to_string()),
        achievements,
    }
}

fn imported_achievement(
    external_id: &str,
    name: &str,
    display_order: i64,
    is_unlocked: bool,
    unlocked_at: Option<i64>,
) -> ImportedAchievement {
    ImportedAchievement {
        external_id: external_id.to_string(),
        name: name.to_string(),
        description: Some(format!("description for {external_id}")),
        icon_url: Some(format!("https://example.com/{external_id}.png")),
        icon_gray_url: Some(format!("https://example.com/{external_id}-gray.png")),
        is_hidden: false,
        display_order,
        is_unlocked,
        unlocked_at,
    }
}
