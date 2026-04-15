use crate::{
    domains::{
        achievement::models::{
            AchievementRecord, AchievementSetRecord, AchievementSourceStatusRecord,
            AchievementUpsertRecord, NewAchievement, NewAchievementSet, NewAchievementSourceStatus,
        },
        game::models::GameLibraryEntry,
    },
    error::AppError,
};
use sqlx::{QueryBuilder, Sqlite, SqlitePool};

pub async fn list_sets_by_game_id(
    pool: &SqlitePool,
    game_id: &str,
    game_launch_id: Option<&str>,
) -> Result<Vec<AchievementSetRecord>, AppError> {
    let sql = match game_launch_id {
        Some(_) => {
            "SELECT
                id,
                game_id,
                game_launch_id,
                storefront_id,
                provider,
                external_set_id,
                external_game_id,
                variant,
                name,
                description,
                version
             FROM achievement_set
             WHERE game_id = ?
               AND (game_launch_id IS NULL OR game_launch_id = ?)
             ORDER BY provider ASC, name ASC, external_set_id ASC, variant ASC"
        }
        None => {
            "SELECT
                id,
                game_id,
                game_launch_id,
                storefront_id,
                provider,
                external_set_id,
                external_game_id,
                variant,
                name,
                description,
                version
             FROM achievement_set
             WHERE game_id = ?
             ORDER BY provider ASC, name ASC, external_set_id ASC, variant ASC"
        }
    };

    let mut query = sqlx::query_as::<_, AchievementSetRecord>(sql).bind(game_id);
    if let Some(game_launch_id) = game_launch_id {
        query = query.bind(game_launch_id);
    }
    query.fetch_all(pool).await.map_err(AppError::from)
}

pub async fn list_source_statuses_by_game_id(
    pool: &SqlitePool,
    game_id: &str,
    game_launch_id: Option<&str>,
) -> Result<Vec<AchievementSourceStatusRecord>, AppError> {
    let sql = match game_launch_id {
        Some(_) => {
            "SELECT
                id,
                game_id,
                game_launch_id,
                storefront_id,
                provider,
                external_game_id,
                has_achievements,
                checked_at
             FROM achievement_source_status
             WHERE game_id = ?
               AND (game_launch_id IS NULL OR game_launch_id = ?)
             ORDER BY provider ASC, external_game_id ASC"
        }
        None => {
            "SELECT
                id,
                game_id,
                game_launch_id,
                storefront_id,
                provider,
                external_game_id,
                has_achievements,
                checked_at
             FROM achievement_source_status
             WHERE game_id = ?
             ORDER BY provider ASC, external_game_id ASC"
        }
    };

    let mut query = sqlx::query_as::<_, AchievementSourceStatusRecord>(sql).bind(game_id);
    if let Some(game_launch_id) = game_launch_id {
        query = query.bind(game_launch_id);
    }
    query.fetch_all(pool).await.map_err(AppError::from)
}

pub async fn list_achievements_by_game_id(
    pool: &SqlitePool,
    game_id: &str,
    game_launch_id: Option<&str>,
) -> Result<Vec<AchievementRecord>, AppError> {
    let sql = match game_launch_id {
        Some(_) => {
            "SELECT
                a.id,
                a.achievement_set_id,
                a.external_id,
                a.name,
                a.description,
                a.icon_url,
                a.icon_gray_url,
                a.is_hidden,
                a.display_order,
                a.is_unlocked,
                a.unlocked_at
             FROM achievement a
             JOIN achievement_set s ON s.id = a.achievement_set_id
             WHERE s.game_id = ?
               AND (s.game_launch_id IS NULL OR s.game_launch_id = ?)
             ORDER BY s.provider ASC, s.name ASC, a.display_order ASC, a.name ASC"
        }
        None => {
            "SELECT
                a.id,
                a.achievement_set_id,
                a.external_id,
                a.name,
                a.description,
                a.icon_url,
                a.icon_gray_url,
                a.is_hidden,
                a.display_order,
                a.is_unlocked,
                a.unlocked_at
             FROM achievement a
             JOIN achievement_set s ON s.id = a.achievement_set_id
             WHERE s.game_id = ?
             ORDER BY s.provider ASC, s.name ASC, a.display_order ASC, a.name ASC"
        }
    };

    let mut query = sqlx::query_as::<_, AchievementRecord>(sql).bind(game_id);
    if let Some(game_launch_id) = game_launch_id {
        query = query.bind(game_launch_id);
    }
    query.fetch_all(pool).await.map_err(AppError::from)
}

pub async fn upsert_source_status(
    pool: &SqlitePool,
    status: &NewAchievementSourceStatus,
) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO achievement_source_status (
            id,
            game_id,
            game_launch_id,
            storefront_id,
            provider,
            external_game_id,
            has_achievements
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT DO UPDATE SET
            storefront_id = excluded.storefront_id,
            has_achievements = excluded.has_achievements,
            checked_at = unixepoch()",
    )
    .bind(&status.id)
    .bind(&status.game_id)
    .bind(&status.game_launch_id)
    .bind(status.storefront_id)
    .bind(&status.provider)
    .bind(&status.external_game_id)
    .bind(status.has_achievements)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn upsert_set(
    pool: &SqlitePool,
    set: &NewAchievementSet,
) -> Result<AchievementSetRecord, AppError> {
    sqlx::query_as::<_, AchievementSetRecord>(
        "INSERT INTO achievement_set (
            id,
            game_id,
            game_launch_id,
            storefront_id,
            provider,
            external_set_id,
            external_game_id,
            variant,
            name,
            description,
            version
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT DO UPDATE SET
            game_launch_id = excluded.game_launch_id,
            storefront_id = excluded.storefront_id,
            external_game_id = excluded.external_game_id,
            name = excluded.name,
            description = excluded.description,
            version = excluded.version,
            updated_at = unixepoch()
         RETURNING
            id,
            game_id,
            game_launch_id,
            storefront_id,
            provider,
            external_set_id,
            external_game_id,
            variant,
            name,
            description,
            version,
            created_at,
            updated_at",
    )
    .bind(&set.id)
    .bind(&set.game_id)
    .bind(&set.game_launch_id)
    .bind(set.storefront_id)
    .bind(&set.provider)
    .bind(&set.external_set_id)
    .bind(&set.external_game_id)
    .bind(&set.variant)
    .bind(&set.name)
    .bind(&set.description)
    .bind(&set.version)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn upsert_achievement(
    pool: &SqlitePool,
    achievement: &NewAchievement,
) -> Result<AchievementUpsertRecord, AppError> {
    sqlx::query_as::<_, AchievementUpsertRecord>(
        "INSERT INTO achievement (
            id,
            achievement_set_id,
            external_id,
            name,
            description,
            icon_url,
            icon_gray_url,
            is_hidden,
            display_order,
            is_unlocked,
            unlocked_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(achievement_set_id, external_id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            icon_url = excluded.icon_url,
            icon_gray_url = excluded.icon_gray_url,
            is_hidden = excluded.is_hidden,
            display_order = excluded.display_order,
            is_unlocked = excluded.is_unlocked,
            unlocked_at = excluded.unlocked_at,
            updated_at = unixepoch()
         RETURNING id, achievement_set_id, external_id",
    )
    .bind(&achievement.id)
    .bind(&achievement.achievement_set_id)
    .bind(&achievement.external_id)
    .bind(&achievement.name)
    .bind(&achievement.description)
    .bind(&achievement.icon_url)
    .bind(&achievement.icon_gray_url)
    .bind(achievement.is_hidden)
    .bind(achievement.display_order)
    .bind(achievement.is_unlocked)
    .bind(achievement.unlocked_at)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn delete_stale_achievements(
    pool: &SqlitePool,
    achievement_set_id: &str,
    keep_external_ids: &[String],
) -> Result<(), AppError> {
    if keep_external_ids.is_empty() {
        sqlx::query("DELETE FROM achievement WHERE achievement_set_id = ?")
            .bind(achievement_set_id)
            .execute(pool)
            .await?;
        return Ok(());
    }

    let mut builder: QueryBuilder<'_, Sqlite> =
        QueryBuilder::new("DELETE FROM achievement WHERE achievement_set_id = ");
    builder.push_bind(achievement_set_id);
    builder.push(" AND external_id NOT IN (");
    let mut separated = builder.separated(", ");
    for external_id in keep_external_ids {
        separated.push_bind(external_id);
    }
    separated.push_unseparated(")");
    builder.build().execute(pool).await?;
    Ok(())
}

pub async fn list_achievement_sync_entries(
    pool: &SqlitePool,
    storefront_id: i64,
    provider_name: &str,
) -> Result<Vec<GameLibraryEntry>, AppError> {
    sqlx::query_as::<_, GameLibraryEntry>(
        "SELECT gle.*
         FROM game_library_entry gle
         LEFT JOIN achievement_source_status ass
           ON ass.game_id = gle.game_id
          AND COALESCE(ass.game_launch_id, '') = ''
          AND ass.provider = ?
          AND ass.external_game_id = gle.external_id
         WHERE gle.storefront_id = ?
           AND (
             ass.id IS NULL
             OR (gle.last_played_at IS NOT NULL AND gle.last_played_at > ass.checked_at)
           )
         ORDER BY gle.external_id ASC",
    )
    .bind(provider_name)
    .bind(storefront_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}
