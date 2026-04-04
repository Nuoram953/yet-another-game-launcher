use std::path::Path;

use reqwest::Client;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    domains::media::{models::NewMedia, repository},
    error::AppError,
};

pub struct FetchAndStoreParams<'a> {
    pub entity_type: &'a str,
    pub entity_id: &'a str,
    pub media_type_id: i64,
    pub media_type_name: &'a str,
    pub source_url: &'a str,
    pub file_name: &'a str,
}

#[instrument(skip(pool, client, data_dir, params))]
pub async fn fetch_and_store(
    pool: &sqlx::SqlitePool,
    client: &Client,
    data_dir: &Path,
    params: FetchAndStoreParams<'_>,
) -> Result<String, AppError> {
    let FetchAndStoreParams {
        entity_type,
        entity_id,
        media_type_id,
        media_type_name,
        source_url,
        file_name,
    } = params;
    let dest = repository::media_path(data_dir, entity_type, entity_id, media_type_name, file_name);

    if let Some(parent) = dest.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| AppError::Internal(format!("create media dir: {e}")))?;
    }

    let bytes = client
        .get(source_url)
        .send()
        .await
        .map_err(|e| AppError::Http(e.to_string()))?
        .error_for_status()
        .map_err(|e| AppError::Http(e.to_string()))?
        .bytes()
        .await
        .map_err(|e| AppError::Http(e.to_string()))?;

    tokio::fs::write(&dest, &bytes)
        .await
        .map_err(|e| AppError::Internal(format!("write media file: {e}")))?;

    let id = Uuid::new_v4().to_string();
    repository::insert(
        pool,
        &NewMedia {
            id: id.clone(),
            entity_type: entity_type.to_string(),
            entity_id: entity_id.to_string(),
            media_type_id,
            file_name: file_name.to_string(),
            source_url: Some(source_url.to_string()),
            is_user: false,
        },
    )
    .await?;

    Ok(id)
}
