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
use std::{ffi::OsStr, path::Path};
use tauri::AppHandle;
use tracing::{debug, info, instrument, warn};

const APPIMAGE_RUNTIME_ENV_VARS: [&str; 4] = ["APPIMAGE", "APPDIR", "OWD", "ARGV0"];
const APPIMAGE_PATH_ENV_VARS: [&str; 3] = ["PATH", "LD_LIBRARY_PATH", "XDG_DATA_DIRS"];
const APPIMAGE_PYTHON_ENV_VARS: [&str; 2] = ["PYTHONHOME", "PYTHONPATH"];
const APPIMAGE_MOUNT_PREFIX: &str = "/tmp/.mount_";

fn clear_appimage_runtime_env(cmd: &mut std::process::Command) {
    for key in APPIMAGE_RUNTIME_ENV_VARS {
        cmd.env_remove(key);
    }
}

fn is_appimage_runtime_path(path: &Path, appdir: Option<&Path>) -> bool {
    path.to_string_lossy().starts_with(APPIMAGE_MOUNT_PREFIX)
        || appdir.is_some_and(|dir| path.starts_with(dir))
}

fn value_contains_appimage_runtime_path(value: &OsStr, appdir: Option<&Path>) -> bool {
    let path = Path::new(value);
    if is_appimage_runtime_path(path, appdir) {
        return true;
    }

    std::env::split_paths(value).any(|segment| is_appimage_runtime_path(&segment, appdir))
}

fn sanitize_appimage_packaging_env(cmd: &mut std::process::Command) {
    clear_appimage_runtime_env(cmd);

    let appdir = std::env::var_os("APPDIR");
    let appdir = appdir.as_deref().map(Path::new);

    for key in APPIMAGE_PYTHON_ENV_VARS {
        if std::env::var_os(key)
            .as_deref()
            .is_some_and(|value| value_contains_appimage_runtime_path(value, appdir))
        {
            cmd.env_remove(key);
        }
    }

    for key in APPIMAGE_PATH_ENV_VARS {
        let Some(value) = std::env::var_os(key) else {
            continue;
        };

        let segments: Vec<_> = std::env::split_paths(&value).collect();
        let filtered: Vec<_> = segments
            .iter()
            .filter(|segment| !is_appimage_runtime_path(segment, appdir))
            .cloned()
            .collect();

        if filtered.len() == segments.len() {
            continue;
        }

        if filtered.is_empty() {
            cmd.env_remove(key);
            continue;
        }

        if let Ok(joined) = std::env::join_paths(filtered) {
            cmd.env(key, joined);
        }
    }
}

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
    let filter = GameFilter {
        name: payload.name,
        has_any_installed: payload.has_any_installed,
    };
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

    let mut cmd = std::process::Command::new(&bin);
    sanitize_appimage_packaging_env(&mut cmd);

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

    tokio::process::Command::from(cmd)
        .spawn()
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

#[cfg(test)]
mod tests {
    use super::{
        clear_appimage_runtime_env, is_appimage_runtime_path, value_contains_appimage_runtime_path,
        APPIMAGE_RUNTIME_ENV_VARS,
    };
    use std::ffi::OsStr;
    use std::path::Path;

    #[test]
    fn clear_appimage_runtime_env_marks_runtime_vars_for_removal() {
        let mut cmd = std::process::Command::new("true");
        clear_appimage_runtime_env(&mut cmd);

        let envs: Vec<_> = cmd.get_envs().collect();
        for key in APPIMAGE_RUNTIME_ENV_VARS {
            assert!(
                envs.iter()
                    .any(|(name, value)| *name == OsStr::new(key) && value.is_none()),
                "expected {key} to be removed from the child environment"
            );
        }
    }

    #[test]
    fn runtime_path_detection_matches_mount_and_appdir_paths() {
        let appdir = Path::new("/tmp/.mount_yagl123/usr");

        assert!(is_appimage_runtime_path(
            Path::new("/tmp/.mount_yagl123/usr/bin/python3"),
            Some(appdir)
        ));
        assert!(is_appimage_runtime_path(
            Path::new("/tmp/.mount_other987/usr/lib"),
            Some(appdir)
        ));
        assert!(!is_appimage_runtime_path(
            Path::new("/usr/bin"),
            Some(appdir)
        ));
    }

    #[test]
    fn python_env_detection_matches_mount_backed_values() {
        let appdir = Path::new("/tmp/.mount_yagl123/usr");

        assert!(value_contains_appimage_runtime_path(
            OsStr::new("/tmp/.mount_yagl123/usr"),
            Some(appdir)
        ));
        assert!(value_contains_appimage_runtime_path(
            OsStr::new("/tmp/.mount_yagl123/usr/lib/python3.11:/usr/lib/python3.11"),
            Some(appdir)
        ));
        assert!(!value_contains_appimage_runtime_path(
            OsStr::new("/usr/lib/python3.11"),
            Some(appdir)
        ));
    }
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
