use sqlx::SqlitePool;

use crate::domains::game::models::{
    Game, GameLaunch, GameLibraryEntry, NewGameLaunch, NewGameLibraryEntry,
};
use crate::domains::media::models::{Media, NewMedia};

pub async fn insert_game(pool: &SqlitePool, id: &str, name: &str, status_id: i64) -> Game {
    sqlx::query!(
        "INSERT INTO game (id, name, game_status_id, is_favorite) VALUES (?, ?, ?, 0)",
        id,
        name,
        status_id,
    )
    .execute(pool)
    .await
    .expect("insert_game failed");

    Game {
        id: id.to_string(),
        name: name.to_string(),
        game_status_id: status_id,
        is_favorite: false,
        igdb_id: None,
    }
}

pub async fn insert_game_status_history(pool: &SqlitePool, game_id: &str, status_id: i64) {
    sqlx::query!(
        "INSERT INTO game_status_history (game_id, game_status_id, created_at) VALUES (?, ?, unixepoch())",
        game_id,
        status_id,
    )
    .execute(pool)
    .await
    .expect("insert_game_status_history failed");
}

pub async fn insert_game_library_entry(
    pool: &SqlitePool,
    id: &str,
    game_id: &str,
    external_id: &str,
) -> GameLibraryEntry {
    crate::domains::game::repository::insert_game_library_entry(
        pool,
        &NewGameLibraryEntry {
            id: id.to_string(),
            game_id: game_id.to_string(),
            storefront_id: 1,
            external_id: external_id.to_string(),
            ..Default::default()
        },
    )
    .await
    .expect("insert_game_library_entry failed")
}

pub async fn insert_game_launch(
    pool: &SqlitePool,
    id: &str,
    game_library_entry_id: &str,
    executable: Option<&str>,
) -> GameLaunch {
    crate::domains::game::repository::insert_game_launch(
        pool,
        &NewGameLaunch {
            id: id.to_string(),
            game_library_entry_id: game_library_entry_id.to_string(),
            name: "Default".to_string(),
            executable: executable.map(str::to_string),
            args: None,
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .expect("insert_game_launch failed")
}

pub async fn insert_media(
    pool: &SqlitePool,
    id: &str,
    entity_type: &str,
    entity_id: &str,
    media_type_id: i64,
    file_name: &str,
    is_user: bool,
) -> Media {
    crate::domains::media::repository::insert(
        pool,
        &NewMedia {
            id: id.to_string(),
            entity_type: entity_type.to_string(),
            entity_id: entity_id.to_string(),
            media_type_id,
            file_name: file_name.to_string(),
            source_url: None,
            is_user,
        },
    )
    .await
    .expect("insert_media failed");

    Media {
        id: id.to_string(),
        entity_type: entity_type.to_string(),
        entity_id: entity_id.to_string(),
        media_type_id,
        file_name: file_name.to_string(),
        source_url: None,
        is_user,
        created_at: 0,
    }
}
