use crate::{
    db::DbPool,
    domains::achievement::{
        models::{GameAchievementData, GetGameAchievementSetsPayload},
        service,
    },
    error::AppError,
};
use tauri::State;

#[tauri::command]
#[specta::specta]
pub async fn get_game_achievement_sets(
    pool: State<'_, DbPool>,
    payload: GetGameAchievementSetsPayload,
) -> Result<GameAchievementData, AppError> {
    service::get_game_achievement_sets(&pool, payload).await
}
