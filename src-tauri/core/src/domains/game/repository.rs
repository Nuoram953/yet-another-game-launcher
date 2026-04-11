use crate::{
    domains::game::models::{
        Game, GameActivity, GameFilter, GameLaunch, GameLibraryEntry, NewGameLaunch,
        NewGameLibraryEntry, UpdateGame, UpdateGameLibraryEntry,
    },
    error::AppError,
    utils::normalize_name,
};
use sqlx::SqlitePool;

pub async fn search_games(pool: &SqlitePool, filter: &GameFilter) -> Result<Vec<Game>, AppError> {
    let mut builder = sqlx::QueryBuilder::new(
        "SELECT game.id, game.name, game.game_status_id, game.is_favorite, game.igdb_id FROM game
        JOIN game_library_entry on game_library_entry.game_id = game.id",
    );

    if let Some(ref name) = filter.name {
        let pattern = format!("%{}%", normalize_name(name));
        builder
            .push(" AND normalized_name LIKE ")
            .push_bind(pattern);
    }

    if filter.has_any_installed.unwrap_or(false) {
        builder
            .push(" AND game_library_entry.is_installed = ")
            .push_bind(true);
    }

    builder
        .build_query_as::<Game>()
        .fetch_all(pool)
        .await
        .map_err(AppError::from)
}

pub async fn find_by_external_id(
    pool: &SqlitePool,
    storefront_id: i64,
    external_id: &str,
) -> Result<Option<GameLibraryEntry>, AppError> {
    sqlx::query_as!(
        GameLibraryEntry,
        "SELECT * FROM game_library_entry WHERE storefront_id = ? AND external_id = ?",
        storefront_id,
        external_id
    )
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn update_game(
    pool: &SqlitePool,
    id: &str,
    update: &UpdateGame,
) -> Result<u64, AppError> {
    let mut builder = sqlx::QueryBuilder::new("UPDATE game SET updated_at = unixepoch()");

    if let Some(ref name) = update.name {
        let normalized = normalize_name(name);
        builder.push(", name = ").push_bind(name.clone());
        builder
            .push(", normalized_name = COALESCE(normalized_name, ")
            .push_bind(normalized)
            .push(")");
    }
    if let Some(status_id) = update.game_status_id {
        builder.push(", game_status_id = ").push_bind(status_id);
    }
    if let Some(is_fav) = update.is_favorite {
        builder.push(", is_favorite = ").push_bind(is_fav);
    }
    if let Some(igdb_id) = update.igdb_id {
        builder.push(", igdb_id = ").push_bind(igdb_id);
    }

    builder.push(" WHERE id = ").push_bind(id);

    let result = builder.build().execute(pool).await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("update_game for game {id}")));
    }

    Ok(result.rows_affected())
}

pub async fn update_game_library_entry(
    pool: &SqlitePool,
    game_id: &str,
    storefront_id: i64,
    update: &UpdateGameLibraryEntry,
) -> Result<u64, AppError> {
    let mut builder =
        sqlx::QueryBuilder::new("UPDATE game_library_entry SET updated_at = unixepoch()");

    if let Some(is_installed) = update.is_installed {
        builder.push(", is_installed = ").push_bind(is_installed);
    }

    if let Some(location) = &update.location {
        builder.push(", location = ").push_bind(location);
    }

    if let Some(size) = update.size {
        builder.push(", size = ").push_bind(size);
    }

    if let Some(time_played) = update.time_played {
        builder.push(", time_played = ").push_bind(time_played);
    }

    if let Some(last_played_at) = update.last_played_at {
        builder
            .push(", last_played_at = ")
            .push_bind(last_played_at);
    }

    builder.push(" WHERE game_id = ").push_bind(game_id);
    builder
        .push(" AND storefront_id = ")
        .push_bind(storefront_id);

    let result = builder.build().execute(pool).await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!(
            "update_game_library_entry for game {game_id} in storefront {storefront_id}"
        )));
    }

    Ok(result.rows_affected())
}

pub async fn insert_game(
    pool: &SqlitePool,
    id: &str,
    name: &str,
    igdb_id: Option<i64>,
) -> Result<(), AppError> {
    let normalized = normalize_name(name);
    sqlx::query!(
        "INSERT INTO game (id, name, normalized_name, game_status_id, is_favorite, igdb_id) VALUES (?, ?, ?, 6, 0, ?)",
        id,
        name,
        normalized,
        igdb_id,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn update_status(
    pool: &SqlitePool,
    game_id: &str,
    status_id: i64,
) -> Result<u64, AppError> {
    let result = sqlx::query!(
        "UPDATE game SET game_status_id = ?, updated_at = unixepoch() WHERE id = ?",
        status_id,
        game_id
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!(
            "update_status for game {game_id}"
        )));
    }

    sqlx::query!(
        "INSERT INTO game_status_history (game_id, game_status_id, created_at)
          VALUES (?, ?, unixepoch())",
        game_id,
        status_id
    )
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}

pub async fn find_by_id(pool: &SqlitePool, id: &str) -> Result<Game, AppError> {
    sqlx::query_as!(
        Game,
        "SELECT id, name, game_status_id, is_favorite, igdb_id FROM game WHERE id = ?",
        id
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound(format!("game {id}")))
}

pub async fn find_game_by_game_launch(
    pool: &SqlitePool,
    game_launch_id: &str,
) -> Result<Game, AppError> {
    sqlx::query_as!(
        Game,
        "SELECT game.id, game.name, game.game_status_id, game.is_favorite, game.igdb_id FROM game
        join game_library_entry gle on gle.game_id = game.id
        join game_launch gl on gl.game_library_entry_id = gle.id
        WHERE gl.id = ?",
        game_launch_id
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound(format!("game launch {game_launch_id}")))
}

pub async fn find_game_by_igdb_id(
    pool: &SqlitePool,
    igdb_id: i64,
) -> Result<Option<Game>, AppError> {
    sqlx::query_as!(
        Game,
        "SELECT id, name, game_status_id, is_favorite, igdb_id FROM game WHERE igdb_id = ?",
        igdb_id
    )
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn find_game_by_normalized_name(
    pool: &SqlitePool,
    normalized: &str,
) -> Result<Option<Game>, AppError> {
    sqlx::query_as!(
        Game,
        "SELECT id, name, game_status_id, is_favorite, igdb_id FROM game WHERE normalized_name = ?",
        normalized
    )
    .fetch_optional(pool)
    .await
    .map_err(AppError::from)
}

pub async fn insert_game_library_entry(
    pool: &SqlitePool,
    entry: &NewGameLibraryEntry,
) -> Result<GameLibraryEntry, AppError> {
    sqlx::query_as!(
        GameLibraryEntry,
        "INSERT INTO game_library_entry (
            id,
            game_id,
            storefront_id,
            external_id,
            is_installed,
            location,
            size,
            time_played,
            last_played_at
        )
        VALUES (?,?,?,?,?,?,?,?,?)
        RETURNING *",
        entry.id,
        entry.game_id,
        entry.storefront_id,
        entry.external_id,
        entry.is_installed,
        entry.location,
        entry.size,
        entry.time_played,
        entry.last_played_at,
    )
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn find_game_launch(pool: &SqlitePool, id: &str) -> Result<GameLaunch, AppError> {
    sqlx::query_as!(GameLaunch, "SELECT * FROM game_launch WHERE id = ?", id)
        .fetch_one(pool)
        .await
        .map_err(|_| AppError::NotFound(format!("game_launch {id}")))
}

pub async fn find_launches_for_game(
    pool: &SqlitePool,
    game_id: &str,
) -> Result<Vec<GameLaunch>, AppError> {
    sqlx::query_as!(
        GameLaunch,
        "SELECT gl.*
         FROM game_launch gl
         JOIN game_library_entry gle ON gle.id = gl.game_library_entry_id
         WHERE gle.game_id = ?
         ORDER BY gl.is_default DESC, gl.created_at ASC",
        game_id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| AppError::Database(e.to_string()))
}

pub async fn find_default_launch_for_game(
    pool: &SqlitePool,
    game_id: &str,
) -> Result<GameLaunch, AppError> {
    sqlx::query_as!(
        GameLaunch,
        "SELECT gl.*
         FROM game_launch gl
         JOIN game_library_entry gle ON gle.id = gl.game_library_entry_id
         WHERE gle.game_id = ?
         ORDER BY gl.is_default DESC, gl.created_at ASC
         LIMIT 1",
        game_id
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound(format!("no launch config for game {game_id}")))
}

pub async fn find_last_game_launch(pool: &SqlitePool) -> Result<GameLaunch, AppError> {
    sqlx::query_as!(
        GameLaunch,
        "SELECT gl.*
         FROM game_launch gl
         JOIN game_activity ga ON ga.game_launch_id = gl.id
         ORDER BY ga.id DESC
         LIMIT 1"
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound("no game launch".to_string()))
}

pub async fn find_game_library_entry(
    pool: &SqlitePool,
    id: &str,
) -> Result<GameLibraryEntry, AppError> {
    sqlx::query_as!(
        GameLibraryEntry,
        "SELECT * FROM game_library_entry WHERE id = ?",
        id
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound(format!("game_library_entry {id}")))
}

pub async fn find_game_library_entry_by_game_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<GameLibraryEntry, AppError> {
    sqlx::query_as!(
        GameLibraryEntry,
        "SELECT * FROM game_library_entry WHERE game_id = ?",
        id
    )
    .fetch_one(pool)
    .await
    .map_err(|_| AppError::NotFound(format!("game_library_entry {id}")))
}

pub async fn find_game_library_entries_by_game_id(
    pool: &SqlitePool,
    id: &str,
) -> Result<Vec<GameLibraryEntry>, AppError> {
    sqlx::query_as!(
        GameLibraryEntry,
        "SELECT * FROM game_library_entry WHERE game_id = ? ORDER BY storefront_id ASC",
        id
    )
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn insert_game_launch(
    pool: &SqlitePool,
    launch: &NewGameLaunch,
) -> Result<GameLaunch, AppError> {
    sqlx::query_as!(
        GameLaunch,
        "INSERT INTO game_launch (id, game_library_entry_id, name, executable, args, working_dir, is_default, env, proton_dir)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *",
        launch.id,
        launch.game_library_entry_id,
        launch.name,
        launch.executable,
        launch.args,
        launch.working_dir,
        launch.is_default,
        launch.env,
        launch.proton_dir,
    )
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}

pub async fn find_total_playtime_for_launch(
    pool: &SqlitePool,
    game_launch_id: &str,
) -> Result<i64, AppError> {
    let row = sqlx::query!(
        "SELECT COALESCE(SUM(duration), 0) as total FROM game_activity WHERE game_launch_id = ?",
        game_launch_id
    )
    .fetch_one(pool)
    .await
    .map_err(AppError::from)?;
    Ok(row.total)
}

pub async fn find_recent_activities_for_launch(
    pool: &SqlitePool,
    game_launch_id: &str,
    limit: i64,
) -> Result<Vec<GameActivity>, AppError> {
    sqlx::query_as!(
        GameActivity,
        "SELECT id as \"id!\", game_launch_id, started_at, ended_at, duration
         FROM game_activity
         WHERE game_launch_id = ?
         ORDER BY started_at DESC
         LIMIT ?",
        game_launch_id,
        limit
    )
    .fetch_all(pool)
    .await
    .map_err(AppError::from)
}

pub async fn insert_activity(
    pool: &SqlitePool,
    game_launch_id: Option<&str>,
    started_at: i64,
    ended_at: i64,
    duration: i64,
) -> Result<GameActivity, AppError> {
    sqlx::query_as!(
        GameActivity,
        "INSERT INTO game_activity (game_launch_id, started_at, ended_at, duration)
         VALUES (?, ?, ?, ?)
         RETURNING id as \"id!\", game_launch_id, started_at, ended_at, duration",
        game_launch_id,
        started_at,
        ended_at,
        duration
    )
    .fetch_one(pool)
    .await
    .map_err(AppError::from)
}
