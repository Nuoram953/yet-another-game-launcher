use crate::{
    domains::achievement::{
        models::{
            Achievement, AchievementSet, AchievementSourceStatus, GameAchievementData,
            GetGameAchievementSetsPayload, ImportedAchievementSet, NewAchievement,
            NewAchievementSet, NewAchievementSourceStatus,
        },
        repository,
    },
    domains::game::models::GameLibraryEntry,
    error::AppError,
};
use std::collections::BTreeMap;
use uuid::Uuid;

pub async fn get_game_achievement_sets(
    pool: &sqlx::SqlitePool,
    payload: GetGameAchievementSetsPayload,
) -> Result<GameAchievementData, AppError> {
    let source_status_rows = repository::list_source_statuses_by_game_id(
        pool,
        &payload.game_id,
        payload.game_launch_id.as_deref(),
    )
    .await?;
    let set_rows =
        repository::list_sets_by_game_id(pool, &payload.game_id, payload.game_launch_id.as_deref())
            .await?;
    let achievement_rows = repository::list_achievements_by_game_id(
        pool,
        &payload.game_id,
        payload.game_launch_id.as_deref(),
    )
    .await?;

    let mut achievements_by_set: BTreeMap<String, Vec<Achievement>> = BTreeMap::new();
    for row in achievement_rows {
        achievements_by_set
            .entry(row.achievement_set_id.clone())
            .or_default()
            .push(Achievement {
                id: row.id,
                achievement_set_id: row.achievement_set_id,
                external_id: row.external_id,
                name: row.name,
                description: row.description,
                icon_url: row.icon_url,
                icon_gray_url: row.icon_gray_url,
                is_hidden: row.is_hidden,
                display_order: row.display_order,
                is_unlocked: row.is_unlocked,
                unlocked_at: row.unlocked_at,
            });
    }

    Ok(GameAchievementData {
        source_statuses: source_status_rows
            .into_iter()
            .map(|row| AchievementSourceStatus {
                id: row.id,
                game_id: row.game_id,
                game_launch_id: row.game_launch_id,
                storefront_id: row.storefront_id,
                provider: row.provider,
                external_game_id: row.external_game_id,
                has_achievements: row.has_achievements,
                checked_at: row.checked_at,
            })
            .collect(),
        sets: set_rows
            .into_iter()
            .map(|row| {
                let achievements = achievements_by_set.remove(&row.id).unwrap_or_default();
                let unlocked_achievements = achievements
                    .iter()
                    .filter(|achievement| achievement.is_unlocked)
                    .count() as i64;
                let total_achievements = achievements.len() as i64;

                AchievementSet {
                    id: row.id,
                    game_id: row.game_id,
                    game_launch_id: row.game_launch_id,
                    storefront_id: row.storefront_id,
                    provider: row.provider,
                    external_set_id: row.external_set_id,
                    external_game_id: row.external_game_id,
                    variant: row.variant,
                    name: row.name,
                    description: row.description,
                    version: row.version,
                    unlocked_achievements,
                    total_achievements,
                    achievements,
                }
            })
            .collect(),
    })
}

pub async fn mark_source_checked(
    pool: &sqlx::SqlitePool,
    status: NewAchievementSourceStatus,
) -> Result<(), AppError> {
    repository::upsert_source_status(pool, &status).await
}

pub async fn sync_imported_set(
    pool: &sqlx::SqlitePool,
    game_id: &str,
    library_entry: &GameLibraryEntry,
    imported_set: ImportedAchievementSet,
) -> Result<(), AppError> {
    repository::upsert_source_status(
        pool,
        &NewAchievementSourceStatus {
            id: Uuid::new_v4().to_string(),
            game_id: game_id.to_string(),
            game_launch_id: imported_set.game_launch_id.clone(),
            storefront_id: imported_set
                .storefront_id
                .or(Some(library_entry.storefront_id)),
            provider: imported_set.provider.clone(),
            external_game_id: imported_set.external_game_id.clone(),
            has_achievements: true,
        },
    )
    .await?;

    let set = repository::upsert_set(
        pool,
        &NewAchievementSet {
            id: Uuid::new_v4().to_string(),
            game_id: game_id.to_string(),
            game_launch_id: imported_set.game_launch_id,
            storefront_id: imported_set
                .storefront_id
                .or(Some(library_entry.storefront_id)),
            provider: imported_set.provider,
            external_set_id: imported_set.external_set_id,
            external_game_id: imported_set.external_game_id,
            variant: imported_set.variant,
            name: imported_set.name,
            description: imported_set.description,
            version: imported_set.version,
        },
    )
    .await?;

    let mut keep_external_ids = Vec::with_capacity(imported_set.achievements.len());

    for (index, imported_achievement) in imported_set.achievements.into_iter().enumerate() {
        keep_external_ids.push(imported_achievement.external_id.clone());
        repository::upsert_achievement(
            pool,
            &NewAchievement {
                id: Uuid::new_v4().to_string(),
                achievement_set_id: set.id.clone(),
                external_id: imported_achievement.external_id,
                name: imported_achievement.name,
                description: imported_achievement.description,
                icon_url: imported_achievement.icon_url,
                icon_gray_url: imported_achievement.icon_gray_url,
                is_hidden: imported_achievement.is_hidden,
                display_order: imported_achievement.display_order.max(index as i64),
                is_unlocked: imported_achievement.is_unlocked,
                unlocked_at: imported_achievement.unlocked_at,
            },
        )
        .await?;
    }

    repository::delete_stale_achievements(pool, &set.id, &keep_external_ids).await?;
    Ok(())
}
