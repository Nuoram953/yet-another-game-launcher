use crate::{
    domains::{
        achievement::models::{
            AchievementRecord, AchievementSetRecord, AchievementSourceRecord,
            AchievementUpsertRecord, NewAchievement, NewAchievementSet, NewAchievementSource,
        },
        game::models::GameLibraryEntry,
    },
    error::AppError,
};
use sqlx::{QueryBuilder, Sqlite, SqlitePool};

async fn get_set_by_id(pool: &SqlitePool, set_id: &str) -> Result<AchievementSetRecord, AppError> {
    sqlx::query_as::<_, AchievementSetRecord>(
        "SELECT
            s.id,
            src.game_id AS game_id,
            src.game_launch_id AS game_launch_id,
            src.storefront_id AS storefront_id,
            src.provider AS provider,
            s.external_set_id AS external_set_id,
            src.external_game_id AS external_game_id,
            s.variant AS variant,
            s.name AS name,
            s.description AS description,
            s.version AS version
         FROM achievement_set s
         JOIN achievement_source src ON src.id = s.achievement_source_id
         WHERE s.id = ?",
    )
    .bind(set_id)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn list_sets_by_game_id(
    pool: &SqlitePool,
    game_id: &str,
    game_launch_id: Option<&str>,
) -> Result<Vec<AchievementSetRecord>, AppError> {
    let sql = match game_launch_id {
        Some(_) => {
            "SELECT
                s.id,
                src.game_id AS game_id,
                src.game_launch_id AS game_launch_id,
                src.storefront_id AS storefront_id,
                src.provider AS provider,
                s.external_set_id AS external_set_id,
                src.external_game_id AS external_game_id,
                s.variant AS variant,
                s.name AS name,
                s.description AS description,
                s.version AS version
             FROM achievement_set s
             JOIN achievement_source src ON src.id = s.achievement_source_id
             WHERE src.game_id = ?
               AND (src.game_launch_id IS NULL OR src.game_launch_id = ?)
             ORDER BY src.provider ASC, s.name ASC, s.external_set_id ASC, s.variant ASC"
        }
        None => {
            "SELECT
                s.id,
                src.game_id AS game_id,
                src.game_launch_id AS game_launch_id,
                src.storefront_id AS storefront_id,
                src.provider AS provider,
                s.external_set_id AS external_set_id,
                src.external_game_id AS external_game_id,
                s.variant AS variant,
                s.name AS name,
                s.description AS description,
                s.version AS version
             FROM achievement_set s
             JOIN achievement_source src ON src.id = s.achievement_source_id
             WHERE src.game_id = ?
             ORDER BY src.provider ASC, s.name ASC, s.external_set_id ASC, s.variant ASC"
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
) -> Result<Vec<AchievementSourceRecord>, AppError> {
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
             FROM achievement_source
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
             FROM achievement_source
             WHERE game_id = ?
             ORDER BY provider ASC, external_game_id ASC"
        }
    };

    let mut query = sqlx::query_as::<_, AchievementSourceRecord>(sql).bind(game_id);
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
             JOIN achievement_source src ON src.id = s.achievement_source_id
             WHERE src.game_id = ?
               AND (src.game_launch_id IS NULL OR src.game_launch_id = ?)
             ORDER BY src.provider ASC, s.name ASC, a.display_order ASC, a.name ASC"
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
             JOIN achievement_source src ON src.id = s.achievement_source_id
             WHERE src.game_id = ?
             ORDER BY src.provider ASC, s.name ASC, a.display_order ASC, a.name ASC"
        }
    };

    let mut query = sqlx::query_as::<_, AchievementRecord>(sql).bind(game_id);
    if let Some(game_launch_id) = game_launch_id {
        query = query.bind(game_launch_id);
    }
    query.fetch_all(pool).await.map_err(AppError::from)
}

pub async fn upsert_source(
    pool: &SqlitePool,
    source: &NewAchievementSource,
) -> Result<AchievementSourceRecord, AppError> {
    sqlx::query_as::<_, AchievementSourceRecord>(
        "INSERT INTO achievement_source (
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
             checked_at = unixepoch()
          RETURNING
             id,
             game_id,
             game_launch_id,
             storefront_id,
             provider,
             external_game_id,
             has_achievements,
             checked_at",
    )
    .bind(&source.id)
    .bind(&source.game_id)
    .bind(&source.game_launch_id)
    .bind(source.storefront_id)
    .bind(&source.provider)
    .bind(&source.external_game_id)
    .bind(source.has_achievements)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn upsert_set(
    pool: &SqlitePool,
    set: &NewAchievementSet,
) -> Result<AchievementSetRecord, AppError> {
    let set_id = sqlx::query_scalar::<_, String>(
        "INSERT INTO achievement_set (
            id,
            achievement_source_id,
            external_set_id,
            variant,
            name,
            description,
            version
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT DO UPDATE SET
             name = excluded.name,
             description = excluded.description,
             version = excluded.version,
             updated_at = unixepoch()
          RETURNING id",
    )
    .bind(&set.id)
    .bind(&set.achievement_source_id)
    .bind(&set.external_set_id)
    .bind(&set.variant)
    .bind(&set.name)
    .bind(&set.description)
    .bind(&set.version)
    .fetch_one(pool)
    .await
    .map_err(AppError::from)?;

    get_set_by_id(pool, &set_id).await
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
         LEFT JOIN achievement_source src
           ON src.game_id = gle.game_id
          AND COALESCE(src.game_launch_id, '') = ''
          AND src.provider = ?
          AND src.external_game_id = gle.external_id
         WHERE gle.storefront_id = ?
           AND (
             src.id IS NULL
             OR (gle.last_played_at IS NOT NULL AND gle.last_played_at > src.checked_at)
            )
          ORDER BY gle.external_id ASC",
    )
    .bind(provider_name)
    .bind(storefront_id)
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}
