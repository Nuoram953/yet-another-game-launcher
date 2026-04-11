use std::path::{Path, PathBuf};

use serde::Deserialize;
use steamlocate::{app::StateFlag, SteamDir};

use crate::error::AppError;

pub const STEAM_DIR_OVERRIDE_ENV: &str = "YAGL_STEAM_DIR";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InstalledApp {
    pub location: String,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AppStatus {
    pub location: String,
    pub size: Option<u64>,
    pub bytes_downloaded: Option<u64>,
    pub bytes_to_download: Option<u64>,
    pub bytes_staged: Option<u64>,
    pub bytes_to_stage: Option<u64>,
    pub staging_size: Option<u64>,
    pub observed_downloaded: Option<u64>,
    pub is_active: bool,
    pub is_installed: bool,
}

pub struct LocalSteamApps {
    steam_dir: Option<SteamDir>,
}

impl LocalSteamApps {
    pub fn locate() -> Result<Self, AppError> {
        Ok(Self {
            steam_dir: locate_steam_dir()?,
        })
    }

    pub fn installed_app(&self, app_id: u64) -> Result<Option<InstalledApp>, AppError> {
        let Some(status) = self.app_status(app_id)? else {
            return Ok(None);
        };
        if !status.is_installed {
            return Ok(None);
        }

        Ok(Some(InstalledApp {
            location: status.location,
            size: status.size,
        }))
    }

    pub fn app_status(&self, app_id: u64) -> Result<Option<AppStatus>, AppError> {
        let Some(steam_dir) = &self.steam_dir else {
            return Ok(None);
        };
        let app_id = u32::try_from(app_id)
            .map_err(|_| AppError::Steam(format!("Steam app id {app_id} is too large")))?;

        let Some((app, library_path)) = find_live_or_installed_app(steam_dir, app_id)? else {
            return Ok(None);
        };

        let location = library_path
            .join("steamapps")
            .join("common")
            .join(&app.install_dir);
        let bytes_to_download = app.bytes_to_download;
        let bytes_downloaded = app.bytes_downloaded;
        let bytes_to_stage = app.bytes_to_stage;
        let bytes_staged = app.bytes_staged;
        let staging_size = app.staging_size;
        let downloading_dir = library_path
            .join("steamapps")
            .join("downloading")
            .join(app_id.to_string());
        let observed_downloaded = dir_size(&downloading_dir)
            .or_else(|| dir_size(&location))
            .filter(|size| *size > 0);
        let is_active = is_app_actively_processing(app.state_flags, bytes_to_download);
        let is_installed =
            is_app_fully_installed(app.state_flags, location.exists(), bytes_to_download);

        Ok(Some(AppStatus {
            location: location.to_string_lossy().into_owned(),
            size: app.size_on_disk,
            bytes_downloaded,
            bytes_to_download,
            bytes_staged,
            bytes_to_stage,
            staging_size,
            observed_downloaded,
            is_active,
            is_installed,
        }))
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
struct AppManifestSnapshot {
    #[serde(rename = "installdir")]
    install_dir: String,
    #[serde(rename = "StateFlags")]
    state_flags: Option<steamlocate::app::StateFlags>,
    size_on_disk: Option<u64>,
    bytes_to_download: Option<u64>,
    bytes_downloaded: Option<u64>,
    bytes_to_stage: Option<u64>,
    bytes_staged: Option<u64>,
    staging_size: Option<u64>,
}

fn find_live_or_installed_app(
    steam_dir: &SteamDir,
    app_id: u32,
) -> Result<Option<(AppManifestSnapshot, PathBuf)>, AppError> {
    let library_paths = steam_dir
        .library_paths()
        .map_err(|e| AppError::Steam(format!("failed to read Steam library paths: {e}")))?;

    for library_path in &library_paths {
        if let Some(app) = read_tmp_manifest(library_path, app_id)? {
            return Ok(Some((app, library_path.clone())));
        }
    }

    steam_dir
        .find_app(app_id)
        .map(|result| {
            result.map(|(app, library)| {
                (
                    AppManifestSnapshot {
                        install_dir: app.install_dir,
                        state_flags: app.state_flags,
                        size_on_disk: app.size_on_disk,
                        bytes_to_download: app.bytes_to_download,
                        bytes_downloaded: app.bytes_downloaded,
                        bytes_to_stage: app.bytes_to_stage,
                        bytes_staged: app.bytes_staged,
                        staging_size: app.staging_size,
                    },
                    library.path().to_path_buf(),
                )
            })
        })
        .map_err(|e| AppError::Steam(format!("failed to read Steam appmanifest: {e}")))
}

fn read_tmp_manifest(
    library_path: &Path,
    app_id: u32,
) -> Result<Option<AppManifestSnapshot>, AppError> {
    let steamapps = library_path.join("steamapps");
    let prefix = format!("appmanifest_{app_id}.acf.");
    let mut newest: Option<(std::time::SystemTime, PathBuf)> = None;

    let entries = match std::fs::read_dir(&steamapps) {
        Ok(entries) => entries,
        Err(_) => return Ok(None),
    };

    for entry in entries {
        let entry =
            entry.map_err(|e| AppError::Steam(format!("failed to read steamapps entry: {e}")))?;
        let path = entry.path();
        let Some(name) = path.file_name().and_then(|n| n.to_str()) else {
            continue;
        };
        if !(name.starts_with(&prefix) && name.ends_with(".tmp")) {
            continue;
        }

        let modified = entry
            .metadata()
            .and_then(|m| m.modified())
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH);
        if newest
            .as_ref()
            .is_none_or(|(current, _)| modified > *current)
        {
            newest = Some((modified, path));
        }
    }

    let Some((_, manifest_path)) = newest else {
        return Ok(None);
    };

    let raw = std::fs::read_to_string(&manifest_path)
        .map_err(|e| AppError::Steam(format!("failed to read live Steam manifest: {e}")))?;
    let manifest: AppManifestSnapshot = keyvalues_serde::from_str(&raw)
        .map_err(|e| AppError::Steam(format!("failed to parse live Steam manifest: {e}")))?;
    Ok(Some(manifest))
}

fn dir_size(path: &Path) -> Option<u64> {
    let metadata = std::fs::metadata(path).ok()?;
    if metadata.is_file() {
        return Some(metadata.len());
    }
    if !metadata.is_dir() {
        return None;
    }

    let mut total = 0u64;
    let entries = std::fs::read_dir(path).ok()?;
    for entry in entries {
        let entry = entry.ok()?;
        total = total.checked_add(dir_size(&entry.path())?)?;
    }
    Some(total)
}

fn is_app_actively_processing(
    state_flags: Option<steamlocate::app::StateFlags>,
    bytes_to_download: Option<u64>,
) -> bool {
    if let Some(flags) = state_flags {
        for flag in flags.flags() {
            match flag {
                StateFlag::Preallocating
                | StateFlag::Downloading
                | StateFlag::Staging
                | StateFlag::Committing
                | StateFlag::UpdateRunning
                | StateFlag::UpdatePaused
                | StateFlag::UpdateStarted
                | StateFlag::UpdateStopping
                | StateFlag::Validating
                | StateFlag::AddingFiles
                | StateFlag::Reconfiguring => return true,
                _ => {}
            }
        }
    }

    bytes_to_download.is_some_and(|remaining| remaining > 0)
}

fn is_app_fully_installed(
    state_flags: Option<steamlocate::app::StateFlags>,
    location_exists: bool,
    bytes_to_download: Option<u64>,
) -> bool {
    if !location_exists {
        return false;
    }

    if let Some(flags) = state_flags {
        let mut fully_installed = false;
        for flag in flags.flags() {
            match flag {
                StateFlag::FullyInstalled => fully_installed = true,
                StateFlag::Preallocating
                | StateFlag::Downloading
                | StateFlag::Staging
                | StateFlag::Committing
                | StateFlag::UpdateRunning
                | StateFlag::UpdatePaused
                | StateFlag::UpdateStarted
                | StateFlag::UpdateStopping
                | StateFlag::Validating
                | StateFlag::AddingFiles
                | StateFlag::Reconfiguring
                | StateFlag::Uninstalling
                | StateFlag::FilesMissing
                | StateFlag::FilesCorrupt
                | StateFlag::UpdateRequired
                | StateFlag::Uninstalled => return false,
                _ => {}
            }
        }

        if fully_installed {
            return true;
        }
    }

    matches!(bytes_to_download, Some(0))
}

#[cfg(target_os = "linux")]
fn locate_steam_dir() -> Result<Option<SteamDir>, AppError> {
    if let Some(path) = steam_dir_override() {
        return SteamDir::from_dir(&path).map(Some).map_err(|e| {
            AppError::Steam(format!(
                "invalid Steam directory override {}: {e}",
                path.display()
            ))
        });
    }

    steamlocate::locate_all()
        .map(|mut dirs| dirs.drain(..).next())
        .map_err(|e| AppError::Steam(format!("failed to locate Steam directory: {e}")))
}

#[cfg(not(target_os = "linux"))]
fn locate_steam_dir() -> Result<Option<SteamDir>, AppError> {
    Ok(None)
}

fn steam_dir_override() -> Option<PathBuf> {
    std::env::var_os(STEAM_DIR_OVERRIDE_ENV)
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}
