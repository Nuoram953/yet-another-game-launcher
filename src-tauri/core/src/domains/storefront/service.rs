use sqlx::SqlitePool;
use tracing::{info, instrument, warn};
use uuid::Uuid;

use super::models::{GameSyncEntry, GameSyncStatus, InstallProgress, SyncResult};
use crate::{
    config::Config,
    domains::{
        achievement::{
            models::NewAchievementSource, repository as achivement_repositery,
            service as achievement_service,
        },
        game::{
            models::{
                GameLibraryEntry, NewGameLaunch, NewGameLibraryEntry, UpdateGameLibraryEntry,
            },
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct StorefrontSyncProgress {
    pub storefront: Storefront,
    pub processed_games: u32,
    pub total_games: u32,
    pub games_added: u32,
    pub games_updated: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct StorefrontAchievementSyncProgress {
    pub storefront: Storefront,
    pub processed_games: u32,
    pub total_games: u32,
    pub games_with_achievements: u32,
    pub games_without_achievements: u32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SyncProgressEvent {
    StorefrontStarted {
        storefront: Storefront,
    },
    StorefrontSkipped {
        storefront: Storefront,
    },
    StorefrontFetched {
        progress: StorefrontSyncProgress,
    },
    GameProcessed {
        entry: Option<GameSyncEntry>,
        progress: StorefrontSyncProgress,
    },
    StorefrontCompleted {
        progress: StorefrontSyncProgress,
    },
    AchievementSyncStarted {
        storefront: Storefront,
    },
    AchievementSyncFetched {
        progress: StorefrontAchievementSyncProgress,
    },
    AchievementProcessed {
        progress: StorefrontAchievementSyncProgress,
    },
    AchievementSyncCompleted {
        progress: StorefrontAchievementSyncProgress,
    },
}

#[instrument(skip(pool, config))]
pub async fn sync_all_libraries(
    pool: &SqlitePool,
    config: &Config,
) -> Result<SyncResult, AppError> {
    let steam_id = std::env::var("STEAM_USER_ID")
        .map_err(|_| AppError::Steam("STEAM_USER_ID env var not set".into()))?;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(SteamProvider::new(steam_id)))];

    let result = sync_with_providers_observed(pool, providers, config, |_| {}).await?;
    sync_storefront_achievements(pool, config).await?;
    Ok(result)
}

#[instrument(skip(pool, providers, config))]
pub async fn sync_with_providers(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
) -> Result<SyncResult, AppError> {
    sync_with_providers_observed(pool, providers, config, |_| {}).await
}

pub async fn sync_with_providers_tracked<F>(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
    mut on_progress: F,
) -> Result<SyncResult, AppError>
where
    F: FnMut(&GameSyncEntry),
{
    sync_with_providers_observed(pool, providers, config, |event| {
        if let SyncProgressEvent::GameProcessed {
            entry: Some(entry), ..
        } = event
        {
            on_progress(&entry);
        }
    })
    .await
}

pub async fn sync_with_providers_observed<F>(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
    on_progress: F,
) -> Result<SyncResult, AppError>
where
    F: FnMut(SyncProgressEvent),
{
    let mut games: Vec<GameSyncEntry> = Vec::new();
    let mut games_added = 0u32;
    let mut games_updated = 0u32;
    let mut on_progress = on_progress;

    for (storefront, provider) in providers {
        on_progress(SyncProgressEvent::StorefrontStarted { storefront });

        if !provider.is_enabled(config) {
            warn!(?storefront, "storefront is disabled in config, skipping");
            on_progress(SyncProgressEvent::StorefrontSkipped { storefront });
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

        let mut storefront_progress = StorefrontSyncProgress {
            storefront,
            processed_games: 0,
            total_games: fetched.len() as u32,
            games_added: 0,
            games_updated: 0,
        };
        on_progress(SyncProgressEvent::StorefrontFetched {
            progress: storefront_progress,
        });

        for game in fetched {
            let entry = sync_game(pool, storefront_id, game).await?;
            storefront_progress.processed_games += 1;

            if let Some(entry) = entry {
                match entry.status {
                    GameSyncStatus::Added => {
                        games_added += 1;
                        storefront_progress.games_added += 1;
                    }
                    GameSyncStatus::Updated => {
                        games_updated += 1;
                        storefront_progress.games_updated += 1;
                    }
                }

                games.push(entry.clone());
                on_progress(SyncProgressEvent::GameProcessed {
                    entry: Some(entry),
                    progress: storefront_progress,
                });
            } else {
                on_progress(SyncProgressEvent::GameProcessed {
                    entry: None,
                    progress: storefront_progress,
                });
            }
        }

        on_progress(SyncProgressEvent::StorefrontCompleted {
            progress: storefront_progress,
        });
    }

    info!(games_added, games_updated, "library sync complete");
    Ok(SyncResult {
        games,
        games_added,
        games_updated,
    })
}

fn provider_name(storefront: Storefront) -> &'static str {
    match storefront {
        Storefront::Steam => "steam",
        Storefront::Custom => "custom",
    }
}

pub async fn sync_achievements_with_providers(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    config: &Config,
) -> Result<(), AppError> {
    sync_achievements_with_providers_observed(pool, providers, config, |_| {}).await
}

pub async fn sync_achievements_with_providers_observed<F>(
    pool: &SqlitePool,
    providers: Vec<(Storefront, Box<dyn StorefrontProvider>)>,
    _: &Config,
    on_progress: F,
) -> Result<(), AppError>
where
    F: FnMut(SyncProgressEvent),
{
    let mut on_progress = on_progress;

    for (storefront, provider) in providers {
        on_progress(SyncProgressEvent::AchievementSyncStarted { storefront });

        let storefront_id = storefront as i64;
        let provider_name = provider_name(storefront);
        let entries = achivement_repositery::list_achievement_sync_entries(
            pool,
            storefront_id,
            provider_name,
        )
        .await?;

        let mut progress = StorefrontAchievementSyncProgress {
            storefront,
            processed_games: 0,
            total_games: entries.len() as u32,
            games_with_achievements: 0,
            games_without_achievements: 0,
        };
        on_progress(SyncProgressEvent::AchievementSyncFetched { progress });

        for entry in entries {
            if let Some(imported_set) = provider.fetch_achievement_set(&entry.external_id).await? {
                achievement_service::sync_imported_set(pool, &entry.game_id, &entry, imported_set)
                    .await?;
                progress.games_with_achievements += 1;
            } else {
                achievement_service::mark_source_checked(
                    pool,
                    NewAchievementSource {
                        id: uuid::Uuid::new_v4().to_string(),
                        game_id: entry.game_id.clone(),
                        game_launch_id: None,
                        storefront_id: Some(storefront_id),
                        provider: provider_name.to_string(),
                        external_game_id: entry.external_id.clone(),
                        has_achievements: false,
                    },
                )
                .await?;
                progress.games_without_achievements += 1;
            }

            progress.processed_games += 1;
            on_progress(SyncProgressEvent::AchievementProcessed { progress });
        }

        on_progress(SyncProgressEvent::AchievementSyncCompleted { progress });
    }

    Ok(())
}

pub async fn sync_storefront_achievements(
    pool: &SqlitePool,
    config: &Config,
) -> Result<(), AppError> {
    let steam_id = std::env::var("STEAM_USER_ID")
        .map_err(|_| AppError::Steam("STEAM_USER_ID env var not set".into()))?;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(SteamProvider::new(steam_id)))];

    sync_achievements_with_providers_observed(pool, providers, config, |_| {}).await
}

#[instrument(skip(config, entry))]
pub async fn install_library_entry(
    config: &Config,
    entry: &GameLibraryEntry,
) -> Result<(), AppError> {
    let provider = install_provider(config, entry)?;
    provider.install_game(&entry.external_id).await
}

#[instrument(skip(config, entry))]
pub async fn uninstall_library_entry(
    config: &Config,
    entry: &GameLibraryEntry,
) -> Result<(), AppError> {
    let provider = install_provider(config, entry)?;
    provider.uninstall_game(&entry.external_id).await
}

#[instrument(skip(config, entry))]
pub fn supports_install_tracking(
    config: &Config,
    entry: &GameLibraryEntry,
) -> Result<bool, AppError> {
    let storefront = Storefront::try_from(entry.storefront_id).map_err(|_| {
        AppError::Internal(format!(
            "unknown storefront {} for library entry {}",
            entry.storefront_id, entry.id
        ))
    })?;

    match storefront {
        Storefront::Steam => Ok(install_provider(config, entry)?.supports_install_tracking()),
        Storefront::Custom => Ok(false),
    }
}

#[instrument(skip(config, entry))]
pub async fn install_progress(
    config: &Config,
    entry: &GameLibraryEntry,
) -> Result<Option<InstallProgress>, AppError> {
    let provider = install_provider(config, entry)?;
    provider.install_progress(&entry.external_id).await
}

fn install_provider(
    config: &Config,
    entry: &GameLibraryEntry,
) -> Result<Box<dyn StorefrontProvider>, AppError> {
    let storefront = Storefront::try_from(entry.storefront_id).map_err(|_| {
        AppError::Internal(format!(
            "unknown storefront {} for library entry {}",
            entry.storefront_id, entry.id
        ))
    })?;

    let provider: Box<dyn StorefrontProvider> = match storefront {
        Storefront::Steam => Box::new(SteamProvider::new("")),
        Storefront::Custom => {
            return Err(AppError::Internal(
                "install is not supported for custom storefront entries".into(),
            ));
        }
    };

    if !provider.is_enabled(config) {
        return Err(AppError::Internal(format!(
            "{storefront:?} storefront is disabled"
        )));
    }

    Ok(provider)
}

async fn sync_game(
    pool: &SqlitePool,
    storefront_id: i64,
    game: StorefrontGame,
) -> Result<Option<GameSyncEntry>, AppError> {
    let existing =
        game_repository::find_by_external_id(pool, storefront_id, &game.external_id).await?;

    if let Some(existing_entry) = existing {
        update_existing_entry(pool, storefront_id, existing_entry, game).await
    } else {
        let entry = add_new_game_entry(pool, storefront_id, game).await?;
        Ok(Some(entry))
    }
}

async fn update_existing_entry(
    pool: &SqlitePool,
    storefront_id: i64,
    existing_entry: crate::domains::game::models::GameLibraryEntry,
    game: StorefrontGame,
) -> Result<Option<GameSyncEntry>, AppError> {
    let new_time_played = game.time_played.map(|t| t as i64);
    let new_last_played_at = game.last_played_at.map(|t| t as i64);
    let new_location = (!game.location.is_empty()).then_some(game.location.clone());
    let new_size = game.size.map(|s| s as i64);

    let time_played_changed = new_time_played.is_some_and(|t| t != existing_entry.time_played);
    let last_played_changed =
        new_last_played_at.is_some_and(|t| existing_entry.last_played_at != Some(t));
    let install_state_changed = existing_entry.is_installed != game.is_installed;
    let location_changed = existing_entry.location != new_location;
    let size_changed = existing_entry.size != new_size;

    let has_changes = time_played_changed
        || last_played_changed
        || install_state_changed
        || location_changed
        || size_changed;

    if !has_changes {
        return Ok(None);
    }

    game_repository::update_game_library_entry(
        pool,
        &existing_entry.game_id,
        storefront_id,
        &UpdateGameLibraryEntry {
            is_installed: install_state_changed.then_some(game.is_installed),
            location: location_changed.then_some(new_location),
            size: size_changed.then_some(new_size),
            time_played: if time_played_changed {
                new_time_played
            } else {
                None
            },
            last_played_at: if last_played_changed {
                Some(new_last_played_at)
            } else {
                None
            },
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
            is_installed: game.is_installed,
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
