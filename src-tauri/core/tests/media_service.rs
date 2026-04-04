use yagl_core::{
    domains::media::{
        models::{DeleteMediaPayload, GetMediaByTypePayload, GetMediaPayload},
        repository, service,
    },
    error::AppError,
    testing::{db::test_db, fixtures::insert_media},
};

// ---------------------------------------------------------------------------
// get_by_entity
// ---------------------------------------------------------------------------

#[tokio::test]
async fn get_by_entity_returns_empty_when_none() {
    let pool = test_db().await;

    let result = service::get_by_entity(
        &pool,
        GetMediaPayload {
            entity_type: "game".to_string(),
            entity_id: "game-1".to_string(),
        },
    )
    .await
    .unwrap();

    assert!(result.is_empty());
}

#[tokio::test]
async fn get_by_entity_returns_all_media_for_entity() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;
    insert_media(&pool, "m2", "game", "game-1", 6, "shot.jpg", false).await;
    insert_media(&pool, "m3", "company", "co-1", 5, "logo.png", false).await; // different entity

    let result = service::get_by_entity(
        &pool,
        GetMediaPayload {
            entity_type: "game".to_string(),
            entity_id: "game-1".to_string(),
        },
    )
    .await
    .unwrap();

    assert_eq!(result.len(), 2);
    let ids: Vec<&str> = result.iter().map(|m| m.id.as_str()).collect();
    assert!(ids.contains(&"m1"));
    assert!(ids.contains(&"m2"));
}

// ---------------------------------------------------------------------------
// get_by_entity_and_type
// ---------------------------------------------------------------------------

#[tokio::test]
async fn get_by_entity_and_type_filters_correctly() {
    let pool = test_db().await;
    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;
    insert_media(&pool, "m2", "game", "game-1", 6, "shot1.jpg", false).await;
    insert_media(&pool, "m3", "game", "game-1", 6, "shot2.jpg", false).await;

    let result = service::get_by_entity_and_type(
        &pool,
        GetMediaByTypePayload {
            entity_type: "game".to_string(),
            entity_id: "game-1".to_string(),
            media_type_id: 6, // screenshot
        },
    )
    .await
    .unwrap();

    assert_eq!(result.len(), 2);
    for m in &result {
        assert_eq!(m.media_type_id, 6);
    }
}

// ---------------------------------------------------------------------------
// store_user_media
// ---------------------------------------------------------------------------

#[tokio::test]
async fn store_user_media_inserts_row_with_is_user_true() {
    let pool = test_db().await;

    let id = service::store_user_media(&pool, "game", "game-1", 1, "my_cover.png")
        .await
        .unwrap();

    let row = repository::find_by_id(&pool, &id).await.unwrap().unwrap();
    assert!(row.is_user);
    assert_eq!(row.entity_type, "game");
    assert_eq!(row.entity_id, "game-1");
    assert_eq!(row.media_type_id, 1);
    assert_eq!(row.file_name, "my_cover.png");
    assert!(row.source_url.is_none());
}

#[tokio::test]
async fn store_user_media_returns_unique_ids_on_each_call() {
    let pool = test_db().await;

    let id1 = service::store_user_media(&pool, "game", "game-1", 1, "a.jpg")
        .await
        .unwrap();
    let id2 = service::store_user_media(&pool, "game", "game-1", 1, "b.jpg")
        .await
        .unwrap();

    assert_ne!(id1, id2);
}

// ---------------------------------------------------------------------------
// delete
// ---------------------------------------------------------------------------

#[tokio::test]
async fn delete_removes_db_row_and_file_on_disk() {
    let pool = test_db().await;
    let tmp = tempfile::tempdir().unwrap();
    let data_dir = tmp.path();

    // Pre-create the file that the service should remove.
    let file_path = repository::media_path(data_dir, "game", "game-1", "cover", "cover.jpg");
    std::fs::create_dir_all(file_path.parent().unwrap()).unwrap();
    std::fs::write(&file_path, b"fake image data").unwrap();
    assert!(file_path.exists());

    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;

    service::delete(
        &pool,
        data_dir,
        DeleteMediaPayload {
            id: "m1".to_string(),
        },
    )
    .await
    .unwrap();

    // DB row gone
    assert!(repository::find_by_id(&pool, "m1").await.unwrap().is_none());
    // File gone
    assert!(!file_path.exists());
}

#[tokio::test]
async fn delete_succeeds_even_when_file_is_already_missing() {
    let pool = test_db().await;
    let tmp = tempfile::tempdir().unwrap();

    insert_media(&pool, "m1", "game", "game-1", 1, "cover.jpg", false).await;

    // No file on disk — should still succeed (best-effort removal).
    service::delete(
        &pool,
        tmp.path(),
        DeleteMediaPayload {
            id: "m1".to_string(),
        },
    )
    .await
    .unwrap();

    assert!(repository::find_by_id(&pool, "m1").await.unwrap().is_none());
}

#[tokio::test]
async fn delete_returns_not_found_for_unknown_id() {
    let pool = test_db().await;
    let tmp = tempfile::tempdir().unwrap();

    let result = service::delete(
        &pool,
        tmp.path(),
        DeleteMediaPayload {
            id: "nonexistent".to_string(),
        },
    )
    .await;

    assert!(
        matches!(result, Err(AppError::NotFound(_))),
        "expected NotFound, got {result:?}"
    );
}
