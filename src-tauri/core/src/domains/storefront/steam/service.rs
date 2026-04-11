use super::{api, local::LocalSteamApps};
use crate::{
    domains::storefront::{
        models::{InstallProgress, StorefrontGame},
        steam::local::AppStatus,
    },
    error::AppError,
};
use sysinfo::Pid;
use tokio::time::Duration;
use tracing::{debug, info, instrument, warn};

const STEAM_API_BASE_URL: &str = "https://api.steampowered.com";

#[instrument(skip(base_url))]
pub async fn sync_library(steam_id: &str, base_url: &str) -> Result<Vec<StorefrontGame>, AppError> {
    info!("fetching Steam library");
    let api_key = std::env::var("STEAM_API_KEY")
        .map_err(|_| AppError::Steam("STEAM_API_KEY env var not set".into()))?;
    let local_apps = LocalSteamApps::locate()?;

    let response = api::get_owned_games(base_url, &api_key, steam_id).await?;
    let games = response.response.games.unwrap_or_default();
    debug!(count = games.len(), "received games from Steam API");

    let mut mapped = Vec::with_capacity(games.len());

    for app in games {
        let Some(name) = app.name else {
            continue;
        };

        let local_install = local_apps.installed_app(app.appid)?;
        let (is_installed, location, size) = match local_install {
            Some(install) => (true, install.location, install.size),
            None => (false, String::new(), None),
        };

        mapped.push(StorefrontGame {
            external_id: app.appid.to_string(),
            name,
            is_installed,
            location,
            size,
            igdb_id: None,
            time_played: app.playtime_forever,
            last_played_at: app.rtime_last_played.and_then(|t| u64::try_from(t).ok()),
        });
    }

    Ok(mapped)
}

#[instrument]
pub fn launch_game(external_id: &str) -> Result<(), AppError> {
    let url = format!("steam://rungameid/{external_id}");
    open_steam_url(&url)
}

pub async fn track_with_finder<F>(
    finder: F,
    find_interval: Duration,
    exit_interval: Duration,
) -> Option<(i64, i64)>
where
    F: Fn() -> Option<Pid> + Send + 'static,
{
    use tokio::time::{sleep, timeout};

    let started_at = chrono::Utc::now().timestamp();

    let found = timeout(Duration::from_secs(120), async {
        loop {
            if finder().is_some() {
                return;
            }
            sleep(find_interval).await;
        }
    })
    .await;

    if found.is_err() {
        warn!("timed out waiting for game process to appear");
        return None;
    }

    debug!("game process detected, waiting for exit");

    let _ = timeout(Duration::from_secs(86400), async {
        loop {
            if finder().is_none() {
                break;
            }
            sleep(exit_interval).await;
        }
    })
    .await;

    Some((started_at, chrono::Utc::now().timestamp()))
}

#[instrument]
pub async fn track_game_session(app_id: &str) -> Option<(i64, i64)> {
    info!("tracking Steam game session");
    let app_id = app_id.to_string();
    track_with_finder(
        move || find_steam_game_process(&app_id),
        Duration::from_secs(2),
        Duration::from_secs(5),
    )
    .await
}

fn find_steam_game_process(app_id: &str) -> Option<Pid> {
    #[cfg(target_os = "linux")]
    {
        let needle = format!("SteamAppId={app_id}");
        return std::fs::read_dir("/proc")
            .ok()?
            .filter_map(|entry| {
                let name = entry.ok()?.file_name();
                let pid: u32 = name.to_str()?.parse().ok()?;
                let environ = std::fs::read(format!("/proc/{pid}/environ")).ok()?;
                let matches = environ.split(|&b| b == 0).any(|kv| kv == needle.as_bytes());
                if matches {
                    Some(Pid::from(pid as usize))
                } else {
                    None
                }
            })
            .next();
    }
    #[allow(unreachable_code)]
    None
}

#[instrument]
pub fn install_game(external_id: &str) -> Result<(), AppError> {
    let url = format!("steam://install/{external_id}");
    open_steam_url(&url)
}

#[instrument]
pub fn install_progress(external_id: &str) -> Result<Option<InstallProgress>, AppError> {
    let app_id: u64 = external_id
        .parse()
        .map_err(|_| AppError::Steam(format!("invalid Steam app id '{external_id}'")))?;
    let local_apps = LocalSteamApps::locate()?;
    Ok(local_apps.app_status(app_id)?.map(map_install_progress))
}

pub fn default_base_url() -> &'static str {
    STEAM_API_BASE_URL
}

fn map_install_progress(status: AppStatus) -> InstallProgress {
    let (downloaded_bytes, total_bytes) = effective_progress(&status)
        .map(|(downloaded, total)| (Some(downloaded), Some(total)))
        .unwrap_or((None, None));

    InstallProgress {
        size: status.size,
        downloaded_bytes,
        total_bytes,
        observed_downloaded: status.observed_downloaded,
        is_active: status.is_active,
        is_installed: status.is_installed,
    }
}

fn effective_progress(status: &AppStatus) -> Option<(u64, u64)> {
    if let Some(remaining) = status.bytes_to_stage {
        let staged = status.bytes_staged.unwrap_or(0);
        let total = status
            .staging_size
            .unwrap_or_else(|| staged.saturating_add(remaining))
            .max(remaining)
            .max(staged);
        if total > 0 {
            return Some((staged.min(total), total));
        }
    }

    let remaining = status.bytes_to_download?;
    let manifest_downloaded = status.bytes_downloaded.unwrap_or(0);
    let total = manifest_downloaded.saturating_add(remaining).max(remaining);
    (total > 0).then_some((manifest_downloaded.min(total), total))
}

fn open_steam_url(url: &str) -> Result<(), AppError> {
    info!(%url, "opening Steam URL");

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(url)
        .spawn()
        .map_err(|e| AppError::Steam(e.to_string()))?;

    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(url)
        .spawn()
        .map_err(|e| AppError::Steam(e.to_string()))?;

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(url)
        .spawn()
        .map_err(|e| AppError::Steam(e.to_string()))?;

    Ok(())
}
