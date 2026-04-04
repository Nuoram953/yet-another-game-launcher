use std::path::PathBuf;

pub fn resolve_db_path(flag: Option<PathBuf>) -> String {
    if let Some(path) = flag {
        return path
            .to_str()
            .expect("--db path is not valid UTF-8")
            .to_string();
    }

    if let Ok(url) = std::env::var("DATABASE_URL") {
        return url.strip_prefix("sqlite://").unwrap_or(&url).to_string();
    }

    platform_default_db_path()
}

fn platform_default_db_path() -> String {
    const APP_ID: &str = "com.nuoram.yet-another-game-launcher";

    #[cfg(target_os = "linux")]
    {
        let base = std::env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                let home = std::env::var("HOME").expect("HOME env var not set");
                PathBuf::from(home).join(".local/share")
            });
        base.join(APP_ID)
            .join("data.db")
            .to_str()
            .expect("path is not valid UTF-8")
            .to_string()
    }

    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").expect("HOME env var not set");
        PathBuf::from(home)
            .join("Library/Application Support")
            .join(APP_ID)
            .join("data.db")
            .to_str()
            .expect("path is not valid UTF-8")
            .to_string()
    }

    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").expect("APPDATA env var not set");
        PathBuf::from(appdata)
            .join(APP_ID)
            .join("data.db")
            .to_str()
            .expect("path is not valid UTF-8")
            .to_string()
    }
}

/// Load the app config from the platform-default location.
pub fn load_config() -> yagl_core::config::Config {
    let path = yagl_core::config::default_config_path();
    yagl_core::config::load(&path).unwrap_or_else(|err| {
        eprintln!("error: {err}");
        std::process::exit(1);
    })
}
