use crate::{
    db::DbPool,
    domains::game::{
        models::{Game, GetByIdPayload, LaunchGamePayload, UpdateStatusPayload},
        service,
    },
    error::AppError,
};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn get_by_id(
    pool: State<'_, DbPool>,
    app: tauri::AppHandle,
    payload: GetByIdPayload,
) -> Result<Game, AppError> {
    service::get_by_id(&pool, &app, payload).await
}

#[tauri::command]
#[specta::specta]
pub async fn update_status(
    pool: State<'_, DbPool>,
    app: tauri::AppHandle,
    payload: UpdateStatusPayload,
) -> Result<(), AppError> {
    service::update_status(&pool, &app, payload).await
}

#[tauri::command]
#[specta::specta]
pub async fn launch_game(
    pool: State<'_, DbPool>,
    _app: tauri::AppHandle,
    payload: LaunchGamePayload,
) -> Result<(), AppError> {
    let pool = pool.inner().clone();
    tokio::spawn(async move { service::launch_and_track(&pool, payload).await });
    Ok(())
}
