use std::sync::{Arc, RwLock};

use crate::{
    config::Config,
    db::DbPool,
    domains::storefront::{models::SyncResult, service},
    error::AppError,
};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn sync_libraries(
    pool: State<'_, DbPool>,
    config: State<'_, Arc<RwLock<Config>>>,
) -> Result<SyncResult, AppError> {
    let cfg = config
        .read()
        .map_err(|_| AppError::Internal("config lock poisoned".into()))?
        .clone();
    service::sync_all_libraries(&pool, &cfg).await
}
