mod common;

use std::{fs, process::Command, thread::sleep, time::Duration};

#[cfg(unix)]
use std::{
    io::Write,
    path::Path,
    process::{Output, Stdio},
};

use common::{strip_ansi, unique_path, write_xdg_open_script};

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

#[cfg(unix)]
fn shell_escape(value: &str) -> String {
    format!("'{}'", value.replace('\'', r"'\''"))
}

#[cfg(unix)]
fn run_uninstall_in_pty(
    db_path: &Path,
    path_env: &str,
    game_id: Option<&str>,
    input: &str,
) -> Output {
    let mut inner_command = format!(
        "env PATH={} {} --db {} uninstall",
        shell_escape(path_env),
        shell_escape(env!("CARGO_BIN_EXE_yagl")),
        shell_escape(db_path.to_str().unwrap())
    );

    if let Some(game_id) = game_id {
        inner_command.push(' ');
        inner_command.push_str(&shell_escape(game_id));
    }

    inner_command.push_str("; sleep 0.1");
    let command_line = format!("sh -lc {}", shell_escape(&inner_command));

    let mut child = Command::new("script")
        .args(["-qec", &command_line, "/dev/null"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(input.as_bytes())
        .unwrap();
    drop(child.stdin.take());

    child.wait_with_output().unwrap()
}

fn read_log_with_retry(path: &std::path::Path) -> String {
    for _ in 0..20 {
        if let Ok(contents) = fs::read_to_string(path) {
            return contents;
        }
        sleep(Duration::from_millis(25));
    }

    fs::read_to_string(path).unwrap()
}

#[tokio::test]
async fn uninstall_starts_for_single_installed_entry() {
    let db_path = unique_path("yagl-uninstall-command.db");
    let bin_dir = unique_path("yagl-uninstall-bin");
    let log_path = write_xdg_open_script(&bin_dir, |log_path| {
        format!(
            "#!/bin/sh\nset -eu\necho \"$1\" > \"{}\"\nexit 0\n",
            log_path.display()
        )
    });

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
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

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "uninstall", "game-1"])
        .env("PATH", path)
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);
    let logged_url = read_log_with_retry(&log_path);

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(stdout.contains("Request to uninstall Balatro has been sent."));
    assert_eq!(logged_url.trim(), "steam://uninstall/440001");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&bin_dir);
}

#[tokio::test]
async fn uninstall_skips_entries_that_are_not_installed() {
    let db_path = unique_path("yagl-uninstall-skips-uninstalled.db");
    let bin_dir = unique_path("yagl-uninstall-skips-uninstalled-bin");
    let log_path = write_xdg_open_script(&bin_dir, |log_path| {
        format!(
            "#!/bin/sh\nset -eu\necho \"$1\" > \"{}\"\nexit 0\n",
            log_path.display()
        )
    });

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-installed", "game-1", "570002").await;
    repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-uninstalled".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: Storefront::Custom as i64,
            external_id: "440001".to_string(),
            ..Default::default()
        },
    )
    .await
    .unwrap();
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

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "uninstall", "game-1"])
        .env("PATH", path)
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);
    let logged_url = read_log_with_retry(&log_path);

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(
        !stdout.contains("Select a library entry to uninstall"),
        "stdout: {stdout}"
    );
    assert!(stdout.contains("Request to uninstall Balatro has been sent."));
    assert_eq!(logged_url.trim(), "steam://uninstall/570002");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&bin_dir);
}

#[tokio::test]
async fn uninstall_errors_when_no_entries_are_uninstallable() {
    let db_path = unique_path("yagl-uninstall-no-installed.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "uninstall", "game-1"])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(!output.status.success());
    assert!(
        stderr.contains("no uninstallable library entries"),
        "stderr: {stderr}"
    );

    let _ = fs::remove_file(&db_path);
}

#[tokio::test]
async fn uninstall_errors_when_game_id_does_not_exist() {
    let db_path = unique_path("yagl-uninstall-missing-game.db");

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args(["--db", db_path.to_str().unwrap(), "uninstall", "ghost-game"])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(!output.status.success());
    assert!(
        stderr.contains("game 'ghost-game' not found"),
        "stderr: {stderr}"
    );
}

#[cfg(unix)]
#[tokio::test]
async fn uninstall_prompts_for_game_selection_when_game_id_is_omitted() {
    let db_path = unique_path("yagl-uninstall-interactive-game.db");
    let bin_dir = unique_path("yagl-uninstall-interactive-game-bin");
    let log_path = write_xdg_open_script(&bin_dir, |log_path| {
        format!(
            "#!/bin/sh\nset -eu\necho \"$1\" > \"{}\"\nexit 0\n",
            log_path.display()
        )
    });

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal", None)
        .await
        .unwrap();
    repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-1".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: Storefront::Steam as i64,
            external_id: "440001".to_string(),
            is_installed: true,
            ..Default::default()
        },
    )
    .await
    .unwrap();
    insert_game_library_entry(&pool, "entry-2", "game-2", "400").await;
    drop(pool);

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = run_uninstall_in_pty(&db_path, &path, None, "\n");

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(
        output.status.success(),
        "stdout: {stdout}\nstderr: {stderr}"
    );
    assert!(stdout.contains("Select a game"), "stdout: {stdout}");
    assert!(stdout.contains("Request to uninstall Balatro has been sent."));
    let logged_url = read_log_with_retry(&log_path);
    assert_eq!(logged_url.trim(), "steam://uninstall/440001");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&bin_dir);
}

#[cfg(unix)]
#[tokio::test]
async fn uninstall_prompts_for_library_entry_selection_when_multiple_entries_are_installed() {
    let db_path = unique_path("yagl-uninstall-interactive-entry.db");
    let bin_dir = unique_path("yagl-uninstall-interactive-entry-bin");
    let log_path = write_xdg_open_script(&bin_dir, |log_path| {
        format!(
            "#!/bin/sh\nset -eu\necho \"$1\" > \"{}\"\nexit 0\n",
            log_path.display()
        )
    });

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-1".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: Storefront::Steam as i64,
            external_id: "440001".to_string(),
            is_installed: true,
            location: Some("/games/balatro-steamapps".to_string()),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    repository::insert_game_library_entry(
        &pool,
        &NewGameLibraryEntry {
            id: "entry-2".to_string(),
            game_id: "game-1".to_string(),
            storefront_id: Storefront::Steam as i64,
            external_id: "570002".to_string(),
            is_installed: true,
            location: Some("/games/balatro-deck".to_string()),
            ..Default::default()
        },
    )
    .await
    .unwrap();
    drop(pool);

    let path = format!(
        "{}:{}",
        bin_dir.display(),
        std::env::var("PATH").unwrap_or_default()
    );
    let output = run_uninstall_in_pty(&db_path, &path, Some("game-1"), "\x1b[B\n");

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(
        output.status.success(),
        "stdout: {stdout}\nstderr: {stderr}"
    );
    assert!(
        stdout.contains("Select a library entry to uninstall"),
        "stdout: {stdout}"
    );
    assert!(stdout.contains("Request to uninstall Balatro has been sent."));
    let logged_url = read_log_with_retry(&log_path);
    assert!(
        matches!(
            logged_url.trim(),
            "steam://uninstall/440001" | "steam://uninstall/570002"
        ),
        "logged_url: {logged_url}"
    );

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&bin_dir);
}
