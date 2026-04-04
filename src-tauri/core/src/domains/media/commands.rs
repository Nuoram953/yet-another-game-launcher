use crate::{
    db::DbPool,
    domains::media::{
        models::{DeleteMediaPayload, GetMediaByTypePayload, GetMediaPayload, Media},
        service,
    },
    error::AppError,
};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
#[specta::specta]
pub async fn get_media_by_entity(
    pool: State<'_, DbPool>,
    _app: AppHandle,
    payload: GetMediaPayload,
) -> Result<Vec<Media>, AppError> {
    service::get_by_entity(&pool, payload).await
}

#[tauri::command]
#[specta::specta]
pub async fn get_media_by_entity_and_type(
    pool: State<'_, DbPool>,
    _app: AppHandle,
    payload: GetMediaByTypePayload,
) -> Result<Vec<Media>, AppError> {
    service::get_by_entity_and_type(&pool, payload).await
}

#[tauri::command]
#[specta::specta]
pub async fn delete_media(
    pool: State<'_, DbPool>,
    app: AppHandle,
    payload: DeleteMediaPayload,
) -> Result<(), AppError> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Internal(e.to_string()))?;
    service::delete(&pool, &data_dir, payload).await
}
