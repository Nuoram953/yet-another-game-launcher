use super::{models::UpdateStatusPayload, repository};
use crate::{
    domains::{
        game::models::{
            Game, GameFilter, GameLaunch, GameLibraryEntry, GetByIdPayload, LaunchGamePayload,
            SearchGamePayload,
        },
        storefront::{
            models::Storefront, providers::StorefrontProvider, steam::provider::SteamProvider,
        },
    },
    error::AppError,
    events,
};
use sqlx::SqlitePool;
use std::path::Path;
use tauri::AppHandle;
use tracing::{debug, info, instrument, warn};

pub async fn get_by_id(
    pool: &SqlitePool,
    _: &AppHandle,
    payload: GetByIdPayload,
) -> Result<Game, AppError> {
    repository::find_by_id(pool, &payload.game_id).await
}

pub async fn update_status(
    pool: &SqlitePool,
    app: &AppHandle,
    payload: UpdateStatusPayload,
) -> Result<(), AppError> {
    repository::update_status(pool, &payload.game_id, payload.status_id).await?;
    let updated = repository::find_by_id(pool, &payload.game_id).await?;
    events::emit_game_updated(app, &updated);
    Ok(())
}

pub async fn search_game(
    pool: &SqlitePool,
    payload: SearchGamePayload,
) -> Result<Vec<Game>, AppError> {
    let filter = GameFilter { name: payload.name };
    repository::search_games(pool, &filter).await
}

#[instrument(skip(pool, payload))]
pub async fn launch_and_track(
    pool: &SqlitePool,
    payload: LaunchGamePayload,
) -> Result<(), AppError> {
    let launch = repository::find_game_launch(pool, &payload.game_launch_id).await?;
    let entry = repository::find_game_library_entry(pool, &launch.game_library_entry_id).await?;
    debug!(launch_id = %launch.id, game_library_entry_id = %launch.game_library_entry_id, "resolved launch config");

    if let Some(ref exe) = launch.executable {
        launch_custom_exe_and_track(pool, &launch, &entry, exe).await
    } else {
        let provider: Box<dyn StorefrontProvider> = match Storefront::try_from(entry.storefront_id)
            .map_err(|_| AppError::Launch(format!("unknown storefront {}", entry.storefront_id)))?
        {
            Storefront::Steam => Box::new(SteamProvider::new("")),
            Storefront::Custom => {
                return Err(AppError::Launch(
                    "custom storefront entry must have an executable".into(),
                ))
            }
        };
        launch_storefront_and_track(pool, &launch, &entry.external_id, provider).await
    }
}

#[instrument(skip(pool, launch, entry))]
pub async fn launch_custom_exe_and_track(
    pool: &SqlitePool,
    launch: &GameLaunch,
    entry: &GameLibraryEntry,
    exe: &str,
) -> Result<(), AppError> {
    let started_at = chrono::Utc::now().timestamp();

    let (bin, prepended_args) = if let Some(ref proton_dir) = launch.proton_dir {
        let proton_bin = Path::new(proton_dir).join("proton");
        info!(proton_bin = %proton_bin.display(), "launching via Proton");
        (
            proton_bin.to_string_lossy().into_owned(),
            Some(vec!["run".to_string(), exe.to_string()]),
        )
    } else {
        info!("spawning custom executable");
        (exe.to_string(), None)
    };

    let mut cmd = tokio::process::Command::new(&bin);

    // Proton compat env vars (user `env` values take precedence).
    if let Some(ref proton_dir) = launch.proton_dir {
        // Steam root is three levels above the Proton directory:
        // Proton - X.Y  →  common  →  steamapps  →  <steam_root>
        let steam_root = Path::new(proton_dir)
            .parent() // common
            .and_then(|p| p.parent()) // steamapps
            .and_then(|p| p.parent()); // steam root
        if let Some(root) = steam_root {
            cmd.env("STEAM_COMPAT_CLIENT_INSTALL_PATH", root);
            let compat_data = root
                .join("steamapps")
                .join("compatdata")
                .join(&entry.external_id);
            cmd.env("STEAM_COMPAT_DATA_PATH", compat_data);
        } else {
            warn!(
                proton_dir,
                "could not derive Steam root from proton_dir; compat env vars not set"
            );
        }
    }

    // User-defined env vars (overrides auto-derived ones above).
    if let Some(ref env_str) = launch.env {
        for line in env_str.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, val)) = line.split_once('=') {
                cmd.env(key, val);
            } else {
                warn!(line, "skipping malformed env line (expected KEY=VALUE)");
            }
        }
    }

    if let Some(extra) = prepended_args {
        cmd.args(&extra);
    }
    if let Some(ref args) = launch.args {
        let parsed = shlex::split(args)
            .ok_or_else(|| AppError::Launch(format!("invalid args string: {args}")))?;
        cmd.args(parsed);
    }
    if let Some(ref dir) = launch.working_dir {
        cmd.current_dir(dir);
    }

    cmd.spawn()
        .map_err(|e| AppError::Launch(e.to_string()))?
        .wait()
        .await
        .map_err(|e| AppError::Launch(e.to_string()))?;

    let ended_at = chrono::Utc::now().timestamp();
    let duration = ended_at - started_at;
    info!(
        duration_secs = duration,
        "session ended, recording activity"
    );

    repository::insert_activity(pool, Some(&launch.id), started_at, ended_at, duration).await?;

    Ok(())
}

#[instrument(skip(pool, launch, provider))]
pub async fn launch_storefront_and_track(
    pool: &SqlitePool,
    launch: &GameLaunch,
    external_id: &str,
    provider: Box<dyn StorefrontProvider>,
) -> Result<(), AppError> {
    info!("launching via storefront provider");
    provider.launch_game(external_id).await?;

    if let Some((started_at, ended_at)) = provider.track_session(external_id).await {
        let duration = ended_at - started_at;
        info!(
            duration_secs = duration,
            "session tracked, recording activity"
        );

        if duration == 0 {
            info!("session tracking was 0 minutes, activity not recorded");
            return Ok(());
        }

        repository::insert_activity(pool, Some(&launch.id), started_at, ended_at, duration).await?;
    } else {
        warn!("session tracking returned no data, activity not recorded");
    }

    Ok(())
}
