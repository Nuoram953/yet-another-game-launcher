use std::path::{Path, PathBuf};

use sqlx::SqlitePool;

use crate::{
    domains::media::models::{Media, NewMedia},
    error::AppError,
};

pub fn media_path(
    data_dir: &Path,
    entity_type: &str,
    entity_id: &str,
    media_type: &str,
    file_name: &str,
) -> PathBuf {
    data_dir
        .join("media")
        .join(entity_type)
        .join(entity_id)
        .join(media_type)
        .join(file_name)
}

pub async fn insert(pool: &SqlitePool, m: &NewMedia) -> Result<(), AppError> {
    sqlx::query!(
        "INSERT INTO media (id, entity_type, entity_id, media_type_id, file_name, source_url, is_user)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        m.id,
        m.entity_type,
        m.entity_id,
        m.media_type_id,
        m.file_name,
        m.source_url,
        m.is_user,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn find_by_id(pool: &SqlitePool, id: &str) -> Result<Option<Media>, AppError> {
    sqlx::query_as!(
        Media,
        "SELECT id, entity_type, entity_id, media_type_id, file_name, source_url, is_user, created_at
         FROM media WHERE id = ?",
        id,
    )
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn find_by_entity(
    pool: &SqlitePool,
    entity_type: &str,
    entity_id: &str,
) -> Result<Vec<Media>, AppError> {
    sqlx::query_as!(
        Media,
        "SELECT id, entity_type, entity_id, media_type_id, file_name, source_url, is_user, created_at
         FROM media
         WHERE entity_type = ? AND entity_id = ?
         ORDER BY is_user DESC, created_at DESC",
        entity_type,
        entity_id,
    )
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn find_by_entity_and_type(
    pool: &SqlitePool,
    entity_type: &str,
    entity_id: &str,
    media_type_id: i64,
) -> Result<Vec<Media>, AppError> {
    sqlx::query_as!(
        Media,
        "SELECT id, entity_type, entity_id, media_type_id, file_name, source_url, is_user, created_at
         FROM media
         WHERE entity_type = ? AND entity_id = ? AND media_type_id = ?
         ORDER BY is_user DESC, created_at DESC",
        entity_type,
        entity_id,
        media_type_id,
    )
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), AppError> {
    let result = sqlx::query!("DELETE FROM media WHERE id = ?", id)
        .execute(pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("media {id}")));
    }
    Ok(())
}
