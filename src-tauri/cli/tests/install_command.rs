use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

use yagl_core::{
    db::connect,
    domains::{
        game::{
            models::{NewGameLibraryEntry, UpdateGameLibraryEntry},
            repository,
        },
        storefront::models::Storefront,
    },
    testing::fixtures::insert_game_library_entry,
};

fn unique_path(prefix: &str) -> PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("{prefix}-{unique}"))
}

fn strip_ansi(value: &str) -> String {
    let mut cleaned = String::new();
    let mut chars = value.chars().peekable();

    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            if chars.next_if_eq(&'[').is_some() {
                for next in chars.by_ref() {
                    if ('@'..='~').contains(&next) {
                        break;
                    }
                }
            }
            continue;
        }

        cleaned.push(ch);
    }

    cleaned
}

fn write_libraryfolders_vdf(steam_root: &Path) {
    let steamapps = steam_root.join("steamapps");
    fs::create_dir_all(steamapps.join("common")).unwrap();
    fs::write(
        steamapps.join("libraryfolders.vdf"),
        format!(
            "\"libraryfolders\"\n{{\n    \"0\"\n    {{\n        \"path\" \"{}\"\n        \"label\" \"\"\n        \"contentid\" \"1\"\n        \"totalsize\" \"0\"\n        \"apps\"\n        {{\n        }}\n    }}\n}}\n",
            steam_root.display()
        ),
    )
    .unwrap();
}

fn write_xdg_open_script(bin_dir: &Path, with_follow_progress: bool) -> PathBuf {
    fs::create_dir_all(bin_dir).unwrap();
    let log_path = bin_dir.join("xdg-open.log");
    let script_path = bin_dir.join("xdg-open");
    let body = if with_follow_progress {
        format!(
            "#!/bin/sh\nset -eu\nurl=\"$1\"\necho \"$url\" > \"{}\"\nappid=\"${{url##*/}}\"\nsteam_root=\"$YAGL_STEAM_DIR\"\nsteamapps=\"$steam_root/steamapps\"\nmkdir -p \"$steamapps\" \"$steamapps/common\"\n(\ncat > \"$steamapps/appmanifest_${{appid}}.acf\" <<EOF\n\"AppState\"\n{{\n    \"appid\" \"${{appid}}\"\n    \"name\" \"Balatro\"\n    \"installdir\" \"Balatro\"\n    \"SizeOnDisk\" \"1024\"\n    \"BytesToDownload\" \"2048\"\n    \"BytesDownloaded\" \"512\"\n}}\nEOF\nsleep 0.3\nmkdir -p \"$steamapps/common/Balatro\"\ncat > \"$steamapps/appmanifest_${{appid}}.acf\" <<EOF\n\"AppState\"\n{{\n    \"appid\" \"${{appid}}\"\n    \"name\" \"Balatro\"\n    \"installdir\" \"Balatro\"\n    \"SizeOnDisk\" \"2048\"\n    \"BytesToDownload\" \"0\"\n    \"BytesDownloaded\" \"2048\"\n}}\nEOF\n) &\nexit 0\n",
            log_path.display()
        )
    } else {
        format!(
            "#!/bin/sh\nset -eu\necho \"$1\" > \"{}\"\nexit 0\n",
            log_path.display()
        )
    };
    fs::write(&script_path, body).unwrap();

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&script_path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms).unwrap();
    }

    log_path
}

#[tokio::test]
async fn install_starts_download_for_single_entry() {
    let db_path = unique_path("yagl-install-command.db");
    let steam_root = unique_path("yagl-install-steam");
    let bin_dir = unique_path("yagl-install-bin");
    let data_home = unique_path("yagl-install-data");
    fs::create_dir_all(&steam_root).unwrap();
    fs::create_dir_all(&data_home).unwrap();
    write_libraryfolders_vdf(&steam_root);
    let log_path = write_xdg_open_script(&bin_dir, false);

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "install", "game-1"])
        .env("PATH", path)
        .env("XDG_DATA_HOME", &data_home)
        .env("YAGL_STEAM_DIR", &steam_root)
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);
    let logged_url = fs::read_to_string(&log_path).unwrap();

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(stdout.contains("Requesting install for Balatro via Steam"));
    assert!(stdout.contains("Download started."));
    assert_eq!(logged_url.trim(), "steam://install/440001");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&steam_root);
    let _ = fs::remove_dir_all(&bin_dir);
    let _ = fs::remove_dir_all(&data_home);
}

#[tokio::test]
async fn install_skips_installed_entries() {
    let db_path = unique_path("yagl-install-skips-installed.db");
    let steam_root = unique_path("yagl-install-skips-installed-steam");
    let bin_dir = unique_path("yagl-install-skips-installed-bin");
    let data_home = unique_path("yagl-install-skips-installed-data");
    fs::create_dir_all(&steam_root).unwrap();
    fs::create_dir_all(&data_home).unwrap();
    write_libraryfolders_vdf(&steam_root);
    let log_path = write_xdg_open_script(&bin_dir, false);

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-installed", "game-1", "440001").await;
    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(true),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    insert_game_library_entry(&pool, "entry-installable", "game-1", "custom-install").await;
    drop(pool);

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "install", "game-1"])
        .env("PATH", path)
        .env("XDG_DATA_HOME", &data_home)
        .env("YAGL_STEAM_DIR", &steam_root)
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);
    let logged_url = fs::read_to_string(&log_path).unwrap();

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(stdout.contains("Requesting install for Balatro via Steam"));
    assert!(stdout.contains("Download started."));
    assert_eq!(logged_url.trim(), "steam://install/custom-install");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&steam_root);
    let _ = fs::remove_dir_all(&bin_dir);
    let _ = fs::remove_dir_all(&data_home);
}

#[tokio::test]
async fn install_follow_reports_download_completion() {
    let db_path = unique_path("yagl-install-follow.db");
    let steam_root = unique_path("yagl-install-follow-steam");
    let bin_dir = unique_path("yagl-install-follow-bin");
    let data_home = unique_path("yagl-install-follow-data");
    fs::create_dir_all(&steam_root).unwrap();
    fs::create_dir_all(&data_home).unwrap();
    write_libraryfolders_vdf(&steam_root);
    let log_path = write_xdg_open_script(&bin_dir, true);

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "install", "game-1", "-f"])
        .env("PATH", path)
        .env("XDG_DATA_HOME", &data_home)
        .env("YAGL_STEAM_DIR", &steam_root)
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);
    let logged_url = fs::read_to_string(&log_path).unwrap();

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(stdout.contains("Following install progress"));
    assert!(stdout.contains("Download complete."));
    assert_eq!(logged_url.trim(), "steam://install/440001");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&steam_root);
    let _ = fs::remove_dir_all(&bin_dir);
    let _ = fs::remove_dir_all(&data_home);
}

#[tokio::test]
async fn install_errors_when_no_entries_are_installable() {
    let db_path = unique_path("yagl-install-no-installable.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-installed", "game-1", "440001").await;
    repository::update_game_library_entry(
        &pool,
        "game-1",
        1,
        &UpdateGameLibraryEntry {
            is_installed: Some(true),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "install", "game-1"])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(!output.status.success());
    assert!(
        stderr.contains("no installable library entries"),
        "stderr: {stderr}"
    );

    let _ = fs::remove_file(&db_path);
}

#[tokio::test]
async fn install_follow_rejects_non_steam_entries() {
    let db_path = unique_path("yagl-install-follow-custom.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-custom".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: Storefront::Custom as i64,
            external_id: "custom-install".to_string(),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "install", "game-1", "-f"])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(!output.status.success());
    assert!(
        stderr.contains("--follow is not supported for Custom installs yet"),
        "stderr: {stderr}"
    );

    let _ = fs::remove_file(&db_path);
}
