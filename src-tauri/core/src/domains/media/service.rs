use std::path::Path;

use sqlx::SqlitePool;
use uuid::Uuid;

use crate::{
    domains::media::{
        models::{DeleteMediaPayload, GetMediaByTypePayload, GetMediaPayload, Media, NewMedia},
        repository,
    },
    error::AppError,
};

pub async fn get_by_entity(
    pool: &SqlitePool,
    payload: GetMediaPayload,
) -> Result<Vec<Media>, AppError> {
    repository::find_by_entity(pool, &payload.entity_type, &payload.entity_id).await
}

pub async fn get_by_entity_and_type(
    pool: &SqlitePool,
    payload: GetMediaByTypePayload,
) -> Result<Vec<Media>, AppError> {
    repository::find_by_entity_and_type(
        pool,
        &payload.entity_type,
        &payload.entity_id,
        payload.media_type_id,
    )
    .await
}

pub async fn store_user_media(
    pool: &SqlitePool,
    entity_type: &str,
    entity_id: &str,
    media_type_id: i64,
    file_name: &str,
) -> Result<String, AppError> {
    let id = Uuid::new_v4().to_string();
    repository::insert(
        pool,
        &NewMedia {
            id: id.clone(),
            entity_type: entity_type.to_string(),
            entity_id: entity_id.to_string(),
            media_type_id,
            file_name: file_name.to_string(),
            source_url: None,
            is_user: true,
        },
    )
    .await?;
    Ok(id)
}

pub async fn delete(
    pool: &SqlitePool,
    data_dir: &Path,
    payload: DeleteMediaPayload,
) -> Result<(), AppError> {
    let media = repository::find_by_id(pool, &payload.id)
        .await?
        .ok_or_else(|| AppError::NotFound(format!("media {}", payload.id)))?;

    let media_type_name = media_type_name_for_id(media.media_type_id);
    let path = repository::media_path(
        data_dir,
        &media.entity_type,
        &media.entity_id,
        &media_type_name,
        &media.file_name,
    );

    repository::delete(pool, &payload.id).await?;

    // Best-effort file removal — don't fail if the file is already gone.
    let _ = tokio::fs::remove_file(&path).await;

    Ok(())
}

fn media_type_name_for_id(id: i64) -> String {
    match id {
        1 => "cover",
        2 => "background",
        3 => "banner",
        4 => "icon",
        5 => "logo",
        6 => "screenshot",
        7 => "video",
        _ => "unknown",
    }
    .to_string()
}
