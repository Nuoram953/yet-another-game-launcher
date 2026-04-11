use sqlx::SqlitePool;
use tracing::{info, instrument, warn};
use uuid::Uuid;

use super::models::{GameSyncEntry, GameSyncStatus, SyncResult};
use crate::{
    config::Config,
    domains::{
        game::{
            models::{NewGameLaunch, NewGameLibraryEntry, UpdateGameLibraryEntry},
            repository as game_repository,
        },
        storefront::{
            models::{Storefront, StorefrontGame},
            providers::StorefrontProvider,
            steam::provider::SteamProvider,
        },
    },
    error::AppError,
    utils::normalize_name,
};

#[instrument(skip(pool, config))]
pub async fn sync_all_libraries(
    pool: &SqlitePool,
    config: &Config,
) -> Result<SyncResult, AppError> {
    let steam_id = std::env::var("STEAM_USER_ID")
        .map_err(|_| AppError::Steam("STEAM_USER_ID env var not set".into()))?;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(SteamProvider::new(steam_id)))];

    sync_with_providers(pool, providers, config).await
}

#[instrument(skip(pool, providers, config))]
pub async fn sync_with_providers(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
) -> Result<SyncResult, AppError> {
    sync_with_providers_tracked(pool, providers, config, |_| {}).await
}

pub async fn sync_with_providers_tracked<F>(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
    on_progress: F,
) -> Result<SyncResult, AppError>
where
    F: Fn(&GameSyncEntry),
{
    let mut games: Vec<GameSyncEntry> = Vec::new();
    let mut games_added = 0u32;
    let mut games_updated = 0u32;

    for (storefront, provider) in providers {
        if !provider.is_enabled(config) {
            warn!(?storefront, "storefront is disabled in config, skipping");
            continue;
        }

        let storefront_id = storefront as i64;
        info!(?storefront, "syncing library");

        let fetched = provider.sync_library().await?;
        info!(
            count = fetched.len(),
            ?storefront,
            "received games from provider"
        );

        for game in fetched {
            if let Some(entry) = sync_game(pool, storefront_id, game).await? {
                match entry.status {
                    GameSyncStatus::Added => games_added += 1,
                    GameSyncStatus::Updated => games_updated += 1,
                }
                on_progress(&entry);
                games.push(entry);
            }
        }
    }

    info!(games_added, games_updated, "library sync complete");
    Ok(SyncResult {
        games,
        games_added,
        games_updated,
    })
}

async fn sync_game(
    pool: &SqlitePool,
    storefront_id: i64,
    game: StorefrontGame,
) -> Result<Option<GameSyncEntry>, AppError> {
    let existing =
        game_repository::find_by_external_id(pool, storefront_id, &game.external_id).await?;

    if let Some(existing_entry) = existing {
        update_existing_entry(
            pool,
            storefront_id,
            &existing_entry.game_id,
            existing_entry.time_played,
            existing_entry.last_played_at,
            game,
        )
        .await
    } else {
        let entry = add_new_game_entry(pool, storefront_id, game).await?;
        Ok(Some(entry))
    }
}

async fn update_existing_entry(
    pool: &SqlitePool,
    storefront_id: i64,
    game_id: &str,
    current_time_played: i64,
    current_last_played_at: Option<i64>,
    game: StorefrontGame,
) -> Result<Option<GameSyncEntry>, AppError> {
    let new_time_played = game.time_played.map(|t| t as i64);
    let new_last_played_at = game.last_played_at.map(|t| t as i64);

    let has_changes = new_time_played.is_some_and(|t| t != current_time_played)
        || new_last_played_at.is_some_and(|t| current_last_played_at != Some(t));

    if !has_changes {
        return Ok(None);
    }

    game_repository::update_game_library_entry(
        pool,
        game_id,
        storefront_id,
        &UpdateGameLibraryEntry {
            time_played: new_time_played,
            last_played_at: new_last_played_at,
            ..Default::default()
        },
    )
    .await?;

    Ok(Some(GameSyncEntry {
        name: game.name,
        status: GameSyncStatus::Updated,
    }))
}

async fn add_new_game_entry(
    pool: &SqlitePool,
    storefront_id: i64,
    game: StorefrontGame,
) -> Result<GameSyncEntry, AppError> {
    let game_id = find_or_create_game(pool, &game.name).await?;

    let entry_id = Uuid::new_v4().to_string();
    let launch_id = Uuid::new_v4().to_string();

    game_repository::insert_game_library_entry(
        pool,
        &NewGameLibraryEntry {
            id: entry_id.clone(),
            game_id,
            storefront_id,
            external_id: game.external_id,
            is_installed: false,
            location: if game.location.is_empty() {
                None
            } else {
                Some(game.location)
            },
            size: game.size.map(|s| s as i64),
            time_played: game.time_played.map(|t| t as i64).unwrap_or(0),
            last_played_at: None,
        },
    )
    .await?;

    game_repository::insert_game_launch(
        pool,
        &NewGameLaunch {
            id: launch_id,
            game_library_entry_id: entry_id,
            name: "Default".to_string(),
            executable: None,
            args: None,
            working_dir: None,
            is_default: true,
            env: None,
            proton_dir: None,
        },
    )
    .await?;

    Ok(GameSyncEntry {
        name: game.name,
        status: GameSyncStatus::Added,
    })
}

async fn find_or_create_game(pool: &SqlitePool, name: &str) -> Result<String, AppError> {
    if let Some(existing) =
        game_repository::find_game_by_normalized_name(pool, &normalize_name(name)).await?
    {
        return Ok(existing.id);
    }

    let id = Uuid::new_v4().to_string();
    game_repository::insert_game(pool, &id, name, None).await?;
    Ok(id)
}
