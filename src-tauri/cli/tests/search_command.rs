use cli_lib::commands::search;
use yagl_core::{
    config::Config,
    domains::game::repository,
    testing::{
        db::test_db,
        fixtures::{insert_game_launch, insert_game_library_entry},
    },
};

#[tokio::test]
async fn search_with_no_games_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();

    let result = search::handle(&pool, None, false, &config).await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn search_with_games_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();
    repository::insert_game(&pool, "game-1", "Half-Life 2", None)
        .await
        .unwrap();

    let result = search::handle(&pool, Some("half-life".to_string()), false, &config).await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn search_with_no_filter_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal 2", None)
        .await
        .unwrap();

    let result = search::handle(&pool, None, false, &config).await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn search_with_non_matching_name_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();

    let result = search::handle(&pool, Some("halo".to_string()), false, &config).await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn search_with_launches_flag_and_no_launch_configs_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();

    insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;

    let result = search::handle(&pool, None, true, &config).await;

    assert!(result.is_ok());
}

#[tokio::test]
async fn search_with_launches_flag_and_launch_configs_returns_ok() {
    let pool = test_db().await;
    let config = Config::default();
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    let entry = insert_game_library_entry(&pool, "entry-1", "game-1", "400").await;
    insert_game_launch(&pool, "launch-1", &entry.id, None).await;

    let result = search::handle(&pool, None, true, &config).await;

    assert!(result.is_ok());
}
