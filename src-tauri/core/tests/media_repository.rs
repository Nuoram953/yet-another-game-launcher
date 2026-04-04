use std::path::PathBuf;

use yagl_core::{
    domains::media::repository,
    error::AppError,
    testing::{db::test_db, fixtures::insert_media},
};

// ---------------------------------------------------------------------------
// media_path
// ---------------------------------------------------------------------------

#[test]
fn media_path_builds_correct_path() {
    let base = PathBuf::from("/data");
    let path = repository::media_path(&base, "games", "game-1", "cover", "cover.jpg");
    assert_eq!(
        path,
        PathBuf::from("/data/media/games/game-1/cover/cover.jpg")
    );
}

// ---------------------------------------------------------------------------
// insert
// ---------------------------------------------------------------------------

#[tokio::test]
async fn insert_media_persists_row() {
    let pool = test_db().await;

    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;

    let found = repository::find_by_id(&pool, "m1").await.unwrap();
    assert!(found.is_some());
    let m = found.unwrap();
    assert_eq!(m.id, "m1");
    assert_eq!(m.entity_type, "game");
    assert_eq!(m.entity_id, "game-1");
    assert_eq!(m.media_type_id, 1);
    assert_eq!(m.file_name, "cover.jpg");
    assert!(!m.is_user);
    assert!(m.created_at > 0);
}

#[tokio::test]
async fn insert_duplicate_media_id_returns_database_error() {
    let pool = test_db().await;

    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;
    let result = repository::insert(
        &pool,
        &yagl_core::domains::media::models::NewMedia {
            id: "m1".to_string(),
            entity_type: "game".to_string(),
            entity_id: "game-1".to_string(),
            media_type_id: 1,
            file_name: "cover2.jpg".to_string(),
            source_url: None,
            is_user: false,
        },
    )
    .await;

    assert!(
        matches!(result, Err(AppError::Database(_))),
        "expected Database error on duplicate id, got {result:?}"
    );
}

// ---------------------------------------------------------------------------
// find_by_id
// ---------------------------------------------------------------------------

#[tokio::test]
async fn find_by_id_returns_none_when_not_found() {
    let pool = test_db().await;

    let result = repository::find_by_id(&pool, "nonexistent").await.unwrap();

    assert!(result.is_none());
}

#[tokio::test]
async fn find_by_id_returns_media_when_found() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 2, "bg.jpg", false).await;

    let result = repository::find_by_id(&pool, "m1").await.unwrap();

    assert!(result.is_some());
    assert_eq!(result.unwrap().file_name, "bg.jpg");
}

// ---------------------------------------------------------------------------
// find_by_entity
// ---------------------------------------------------------------------------

#[tokio::test]
async fn find_by_entity_returns_empty_when_none() {
    let pool = test_db().await;

    let results = repository::find_by_entity(&pool, "game", "game-1")
        .await
        .unwrap();

    assert!(results.is_empty());
}

#[tokio::test]
async fn find_by_entity_returns_all_rows_for_entity() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;
    insert_media(&pool, "m2", "game", "game-1", 6, "screenshot1.jpg", false).await;
    insert_media(&pool, "m3", "game", "game-2", 1, "cover.jpg", false).await; // different entity

    let results = repository::find_by_entity(&pool, "game", "game-1")
        .await
        .unwrap();

    assert_eq!(results.len(), 2);
    let ids: Vec<&str> = results.iter().map(|m| m.id.as_str()).collect();
    assert!(ids.contains(&"m1"));
    assert!(ids.contains(&"m2"));
}

#[tokio::test]
async fn find_by_entity_orders_user_media_first() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "auto.jpg", false).await;
    insert_media(&pool, "m2", "game", "game-1", 1, "user.jpg", true).await;

    let results = repository::find_by_entity(&pool, "game", "game-1")
        .await
        .unwrap();

    assert_eq!(results[0].id, "m2", "user media should sort first");
    assert_eq!(results[1].id, "m1");
}

// ---------------------------------------------------------------------------
// find_by_entity_and_type
// ---------------------------------------------------------------------------

#[tokio::test]
async fn find_by_entity_and_type_filters_to_matching_type_only() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await; // cover
    insert_media(&pool, "m2", "game", "game-1", 6, "shot1.jpg", false).await; // screenshot
    insert_media(&pool, "m3", "game", "game-1", 6, "shot2.jpg", false).await; // screenshot

    let results = repository::find_by_entity_and_type(&pool, "game", "game-1", 6)
        .await
        .unwrap();

    assert_eq!(results.len(), 2);
    let ids: Vec<&str> = results.iter().map(|m| m.id.as_str()).collect();
    assert!(ids.contains(&"m2"));
    assert!(ids.contains(&"m3"));
}

#[tokio::test]
async fn find_by_entity_and_type_returns_empty_when_no_match() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;

    let results = repository::find_by_entity_and_type(&pool, "game", "game-1", 7) // video
        .await
        .unwrap();

    assert!(results.is_empty());
}

// ---------------------------------------------------------------------------
// delete
// ---------------------------------------------------------------------------

#[tokio::test]
async fn delete_removes_row_from_db() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;

    repository::delete(&pool, "m1").await.unwrap();

    let found = repository::find_by_id(&pool, "m1").await.unwrap();
    assert!(found.is_none());
}

#[tokio::test]
async fn delete_returns_not_found_for_unknown_id() {
    let pool = test_db().await;

    let result = repository::delete(&pool, "nonexistent").await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}
