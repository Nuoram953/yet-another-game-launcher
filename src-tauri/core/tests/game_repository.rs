use yagl_core::{
    domains::game::{
        models::{
            GameFilter, NewGameLaunch, NewGameLibraryEntry, UpdateGame, UpdateGameLibraryEntry,
        },
        repository,
    },
    error::AppError,
    testing::{
        db::test_db,
        fixtures::{insert_game, insert_game_launch, insert_game_library_entry},
    },
};

#[tokio::test]
async fn find_game_not_found() {
    let pool = test_db().await;

    let result = repository::find_by_id(&pool, "nonexistent-id").await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn get_game_by_id() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Half-Life 3", 1).await;

    let result = repository::find_by_id(&pool, &game.id).await;

    assert_eq!(game.id, result.unwrap().id);
}

#[tokio::test]
async fn update_status_changes_game_status() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Half-Life 3", 1).await;

    repository::update_status(&pool, "game-1", 3).await.unwrap();

    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert_eq!(game.game_status_id, 3);
}

#[tokio::test]
async fn update_non_existing_status_changes_game_status_returns_error() {
    let pool = test_db().await;

    let result = repository::update_status(&pool, "game-1", 3).await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected Database error on duplicate insert, got {result:?}"
    );
}

#[tokio::test]
async fn update_status_records_history() {
    let pool = test_db().await;
    insert_game(&pool, "game-2", "Portal 3", 1).await;

    repository::update_status(&pool, "game-2", 2).await.unwrap();

    let count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM game_status_history WHERE game_id = ?",
        "game-2"
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(count, 1);
}

#[tokio::test]
async fn insert_activity() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal 3", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "70000").await;

    let launch = repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-1".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Default".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    let activity = repository::insert_activity(&pool, Some(&launch.id), 1000, 4600, 3600)
        .await
        .unwrap();

    assert_eq!(activity.game_launch_id.as_deref(), Some(launch.id.as_str()));
    assert_eq!(activity.started_at, 1000);
    assert_eq!(activity.ended_at, 4600);
    assert_eq!(activity.duration, 3600);
}

#[tokio::test]
async fn insert_game_library_entry_returns_entry() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Half-Life 3", 1).await;

    let entry = repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-1".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: 1,
            external_id: "70000".to_string(),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    assert_eq!(entry.id, "entry-1");
    assert_eq!(entry.game_id, "game-1");
    assert_eq!(entry.storefront_id, 1);
    assert_eq!(entry.external_id, "70000");
    assert!(!entry.is_installed);
    assert_eq!(entry.time_played, 0);
    assert!(entry.created_at > 0);
}

#[tokio::test]
async fn insert_duplicate_game_library_entry_returns_error() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Half-Life 3", 1).await;

    let entry = NewGameLibraryEntry {
        id: "entry-1".to_string(),
        game_id: "game-1".to_string(),
        storefront_id: 1,
        external_id: "70000".to_string(),
        ..Default::default()
    };

    repository::insert_game_library_entry(&pool, &entry)
        .await
        .unwrap();

    let result = repository::insert_game_library_entry(&pool, &entry).await;

    assert!(
        matches!(result, Err(AppError::Database(_))),
        "expected Database error on duplicate insert, got {result:?}"
    );
}

#[tokio::test]
async fn find_by_external_id_returns_none_when_not_found() {
    let pool = test_db().await;

    let result = repository::find_by_external_id(&pool, 1, "99999")
        .await
        .unwrap();

    assert!(result.is_none());
}

#[tokio::test]
async fn find_by_external_id_returns_entry_when_found() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Half-Life 3", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "70000").await;

    let result = repository::find_by_external_id(&pool, 1, "70000")
        .await
        .unwrap();

    assert!(result.is_some());
    let entry = result.unwrap();
    assert_eq!(entry.id, "entry-1");
    assert_eq!(entry.external_id, "70000");
    assert_eq!(entry.storefront_id, 1);
}

#[tokio::test]
async fn find_by_external_id_does_not_match_different_storefront() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Half-Life 3", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "70000").await;

    let result = repository::find_by_external_id(&pool, 0, "70000")
        .await
        .unwrap();

    assert!(result.is_none());
}

#[tokio::test]
async fn insert_game_creates_game_with_todo_status() {
    let pool = test_db().await;

    repository::insert_game(&pool, "game-1", "Rimworld", None)
        .await
        .unwrap();

    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert_eq!(game.id, "game-1");
    assert_eq!(game.name, "Rimworld");
    assert_eq!(game.game_status_id, 6);
    assert!(!game.is_favorite);
    assert!(game.igdb_id.is_none());
}

#[tokio::test]
async fn insert_game_with_duplicate_id_returns_error() {
    let pool = test_db().await;

    repository::insert_game(&pool, "game-1", "Rimworld", None)
        .await
        .unwrap();
    let result = repository::insert_game(&pool, "game-1", "Rimworld", None).await;

    assert!(
        matches!(result, Err(AppError::Database(_))),
        "expected Database error on duplicate id, got {result:?}"
    );
}

#[tokio::test]
async fn search_games_no_filter_returns_all_games() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;

    let games = repository::search_games(&pool, &GameFilter::default())
        .await
        .unwrap();

    assert_eq!(games.len(), 2);
}

#[tokio::test]
async fn search_games_by_name_returns_matching_games() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Half-Life 2", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;

    let games = repository::search_games(
        &pool,
        &GameFilter {
            name: Some("halflife".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].name, "Half-Life 2");
}

#[tokio::test]
async fn search_games_name_filter_is_case_insensitive() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Half-Life 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;

    let games = repository::search_games(
        &pool,
        &GameFilter {
            name: Some("HALFLIFE".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].id, "game-1");
}

#[tokio::test]
async fn search_games_by_name_returns_empty_when_no_match() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;

    let games = repository::search_games(
        &pool,
        &GameFilter {
            name: Some("halo".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert!(games.is_empty());
}

#[tokio::test]
async fn search_games_partial_name_returns_multiple_matches() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal 2", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-3", "Half-Life 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;
    insert_game_library_entry(&pool, "entry-3", "game-3", "333").await;

    let games = repository::search_games(
        &pool,
        &GameFilter {
            name: Some("portal".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 2);
}

#[tokio::test]
async fn search_games_strips_special_chars_from_query() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Batman: Arkham City", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;

    let games = repository::search_games(
        &pool,
        &GameFilter {
            name: Some("Batman Arkham".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].id, "game-1");
}

#[tokio::test]
async fn search_games_returns_empty_when_no_games_in_db() {
    let pool = test_db().await;

    let games = repository::search_games(&pool, &GameFilter::default())
        .await
        .unwrap();

    assert!(games.is_empty());
}

#[tokio::test]
async fn update_game_updates_name() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Old Name", 1).await;

    repository::update_game(
        &pool,
        "game-1",
        &UpdateGame {
            name: Some("New Name".to_string()),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert_eq!(game.name, "New Name");
}

#[tokio::test]
async fn update_game_updates_status_id() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;

    repository::update_game(
        &pool,
        "game-1",
        &UpdateGame {
            game_status_id: Some(3),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert_eq!(game.game_status_id, 3);
}

#[tokio::test]
async fn update_game_updates_is_favorite() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;

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

    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert!(game.is_favorite);
}

#[tokio::test]
async fn update_game_returns_error_for_nonexistent_id() {
    let pool = test_db().await;

    let result = repository::update_game(
        &pool,
        "nonexistent",
        &UpdateGame {
            name: Some("Anything".to_string()),
            ..Default::default()
        },
    )
    .await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn update_game_library_entry_updates_time_played() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            time_played: Some(3600),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    let entry = repository::find_game_library_entry(&pool, "entry-1")
        .await
        .unwrap();
    assert_eq!(entry.time_played, 3600);
}

#[tokio::test]
async fn update_game_library_entry_updates_is_installed() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(true),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    let entry = repository::find_game_library_entry(&pool, "entry-1")
        .await
        .unwrap();
    assert!(entry.is_installed);
}

#[tokio::test]
async fn update_game_library_entry_can_clear_location_and_size() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(true),
            location: Some(Some("/games/portal".to_string())),
            size: Some(Some(5_000)),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(false),
            location: Some(None),
            size: Some(None),
            ..Default::default()
        },
    )
    .await
    .unwrap();

    let entry = repository::find_game_library_entry(&pool, "entry-1")
        .await
        .unwrap();
    assert!(!entry.is_installed);
    assert_eq!(entry.location, None);
    assert_eq!(entry.size, None);
}

#[tokio::test]
async fn update_game_library_entry_returns_error_for_nonexistent() {
    let pool = test_db().await;

    let result = repository::update_game_library_entry(
        &pool,
        "nonexistent-game",
        1,
        &UpdateGameLibraryEntry {
            time_played: Some(100),
            ..Default::default()
        },
    )
    .await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn find_game_by_igdb_id_returns_none_when_not_found() {
    let pool = test_db().await;

    let result = repository::find_game_by_igdb_id(&pool, 99999)
        .await
        .unwrap();

    assert!(result.is_none());
}

#[tokio::test]
async fn find_game_by_igdb_id_returns_game_when_found() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", Some(12345))
        .await
        .unwrap();

    let result = repository::find_game_by_igdb_id(&pool, 12345)
        .await
        .unwrap();

    assert!(result.is_some());
    let game = result.unwrap();
    assert_eq!(game.id, "game-1");
    assert_eq!(game.igdb_id, Some(12345));
}

#[tokio::test]
async fn find_game_by_normalized_name_returns_none_when_not_found() {
    let pool = test_db().await;

    let result = repository::find_game_by_normalized_name(&pool, "doesnotexist")
        .await
        .unwrap();

    assert!(result.is_none());
}

#[tokio::test]
async fn find_game_by_normalized_name_returns_game_when_found() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal 2", None)
        .await
        .unwrap();

    let result = repository::find_game_by_normalized_name(&pool, "portal2")
        .await
        .unwrap();

    assert!(result.is_some());
    assert_eq!(result.unwrap().id, "game-1");
}

#[tokio::test]
async fn find_game_launch_returns_not_found_for_nonexistent() {
    let pool = test_db().await;

    let result = repository::find_game_launch(&pool, "nonexistent-launch").await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn find_game_launch_returns_launch_when_found() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    insert_game_launch(&pool, "launch-1", &entry.id, None).await;

    let result = repository::find_game_launch(&pool, "launch-1")
        .await
        .unwrap();

    assert_eq!(result.id, "launch-1");
    assert_eq!(result.game_library_entry_id, "entry-1");
}

#[tokio::test]
async fn find_game_library_entry_returns_not_found_for_nonexistent() {
    let pool = test_db().await;

    let result = repository::find_game_library_entry(&pool, "nonexistent-entry").await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn find_game_library_entry_returns_entry_when_found() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    let result = repository::find_game_library_entry(&pool, "entry-1")
        .await
        .unwrap();

    assert_eq!(result.id, "entry-1");
    assert_eq!(result.game_id, "game-1");
    assert_eq!(result.external_id, "400");
}

#[tokio::test]
async fn find_launches_for_game_returns_empty_when_no_launches() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    let launches = repository::find_launches_for_game(&pool, "game-1")
        .await
        .unwrap();

    assert!(launches.is_empty());
}

#[tokio::test]
async fn find_launches_for_game_returns_all_launches() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-1".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Launch One".to_string(),
            executable: None,
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
            name: "Launch Two".to_string(),
            executable: Some("/usr/bin/game".to_string()),
            args: None,
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    let launches = repository::find_launches_for_game(&pool, "game-1")
        .await
        .unwrap();

    assert_eq!(launches.len(), 2);
}

#[tokio::test]
async fn find_launches_for_game_orders_default_first() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-non-default".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Non-default".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-default".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Default".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    let launches = repository::find_launches_for_game(&pool, "game-1")
        .await
        .unwrap();

    assert_eq!(launches.len(), 2);
    assert!(launches[0].is_default, "default launch should come first");
}

#[tokio::test]
async fn find_default_launch_for_game_returns_not_found_when_no_launches() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;

    let result = repository::find_default_launch_for_game(&pool, "game-1").await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}

#[tokio::test]
async fn find_default_launch_for_game_returns_default_launch() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    insert_game_launch(&pool, "launch-1", &entry.id, None).await;

    let launch = repository::find_default_launch_for_game(&pool, "game-1")
        .await
        .unwrap();

    assert_eq!(launch.id, "launch-1");
    assert!(launch.is_default);
}

#[tokio::test]
async fn find_default_launch_for_game_falls_back_to_first_when_no_default() {
    let pool = test_db().await;
    insert_game(&pool, "game-1", "Portal", 1).await;
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-first".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "First".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();
    repository::insert_game_launch(
        &pool,
        &NewGameLaunch {
            id: "launch-second".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Second".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    let launch = repository::find_default_launch_for_game(&pool, "game-1")
        .await
        .unwrap();

    assert_eq!(
        launch.id, "launch-first",
        "should fall back to first-created launch when no default is set"
    );
}
