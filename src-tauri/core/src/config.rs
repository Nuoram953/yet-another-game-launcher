use std::{
    path::PathBuf,
    sync::{Arc, RwLock},
};

use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct Config {
    #[serde(default)]
    pub storefront: StorefrontConfig,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct StorefrontConfig {
    #[serde(default)]
    pub steam: SteamConfig,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SteamConfig {
    pub enable: bool,
}

impl Default for SteamConfig {
    fn default() -> Self {
        Self { enable: true }
    }
}

const APP_ID: &str = "com.nuoram.yet-another-game-launcher";

pub fn default_config_path() -> PathBuf {
    #[cfg(target_os = "linux")]
    {
        let base = std::env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let home = std::env::var("HOME").expect("HOME env var not set");
                PathBuf::from(home).join(".local/share")
            });
        base.join(APP_ID).join("config.toml")
    }

    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").expect("HOME env var not set");
        PathBuf::from(home)
            .join("Library/Application Support")
            .join(APP_ID)
            .join("config.toml")
    }

    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").expect("APPDATA env var not set");
        PathBuf::from(appdata).join(APP_ID).join("config.toml")
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("failed to read config file at {path}: {source}")]
    Io {
        path: PathBuf,
        source: std::io::Error,
    },
    #[error("failed to parse config file at {path}: {source}")]
    Parse {
        path: PathBuf,
        source: toml::de::Error,
    },
    #[error("failed to set up config file watcher: {0}")]
    Watcher(#[from] notify::Error),
}

pub fn load(path: &std::path::Path) -> Result<Config, ConfigError> {
    if !path.exists() {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|source| ConfigError::Io {
                path: parent.to_path_buf(),
                source,
            })?;
        }
        let default_toml = include_str!("default_config.toml");
        std::fs::write(path, default_toml).map_err(|source| ConfigError::Io {
            path: path.to_path_buf(),
            source,
        })?;
        return Ok(Config::default());
    }

    let raw = std::fs::read_to_string(path).map_err(|source| ConfigError::Io {
        path: path.to_path_buf(),
        source,
    })?;
    toml::from_str(&raw).map_err(|source| ConfigError::Parse {
        path: path.to_path_buf(),
        source,
    })
}

pub fn watch(
    path: PathBuf,
    shared: Arc<RwLock<Config>>,
) -> Result<RecommendedWatcher, ConfigError> {
    let watch_path = path.clone();
    let mut watcher =
        notify::recommended_watcher(move |result: notify::Result<Event>| match result {
            Ok(event) if event.kind.is_modify() || event.kind.is_create() => {
                match load(&watch_path) {
                    Ok(new_cfg) => {
                        if let Ok(mut guard) = shared.write() {
                            *guard = new_cfg;
                            tracing::info!("config reloaded from {:?}", watch_path);
                        }
                    }
                    Err(err) => {
                        tracing::error!("config reload failed: {err}");
                    }
                }
            }
            Err(err) => tracing::error!("config watcher error: {err}"),
            _ => {}
        })?;

    let watch_dir = path.parent().unwrap_or(&path);
    watcher.watch(watch_dir, RecursiveMode::NonRecursive)?;

    Ok(watcher)
}
