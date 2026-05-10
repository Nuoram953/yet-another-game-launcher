mod common;

use std::process::Command;

use common::{strip_ansi, unique_path};

use yagl_core::{
    db::connect,
    domains::game::{models::GameStatus, repository},
    testing::fixtures::insert_game_library_entry,
};

#[tokio::test]
async fn status_updates_game_with_explicit_status() {
    let db_path = unique_path("yagl-status-explicit.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args([
            "--db",
            db_path.to_str().unwrap(),
            "status",
            "game-1",
            "--status",
            "Playing",
        ])
        .output()
        .unwrap();

    let stdout = strip_ansi(&String::from_utf8_lossy(&output.stdout));
    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(output.status.success(), "stderr: {stderr}");
    assert!(
        stdout.contains("Status for Balatro updated to Playing"),
        "stdout: {stdout}"
    );

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    let game = repository::find_by_id(&pool, "game-1").await.unwrap();
    assert_eq!(game.game_status_id, GameStatus::Playing as i64);

    let _ = std::fs::remove_file(&db_path);
}

#[tokio::test]
async fn status_fails_for_unknown_status_value() {
    let db_path = unique_path("yagl-status-unknown.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args([
            "--db",
            db_path.to_str().unwrap(),
            "status",
            "game-1",
            "--status",
            "UnknownStatus",
        ])
        .output()
        .unwrap();

    let stderr = String::from_utf8_lossy(&output.stderr);

    assert!(!output.status.success());
    assert!(
        stderr.contains("unknown status 'UnknownStatus'"),
        "stderr: {stderr}"
    );

    let _ = std::fs::remove_file(&db_path);
}

#[tokio::test]
async fn status_fails_for_nonexistent_game_id() {
    let db_path = unique_path("yagl-status-missing-game.db");

    let output = Command::new(env!("CARGO_BIN_EXE_yagl"))
        .args([
            "--db",
            db_path.to_str().unwrap(),
            "status",
            "ghost-game",
            "--status",
            "Playing",
        ])
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
async fn status_prompts_for_game_and_status_when_both_omitted() {
    use std::{io::Write, process::Stdio};

    let db_path = unique_path("yagl-status-interactive.db");

    let pool = connect(db_path.to_str().unwrap()).await.unwrap();
    repository::insert_game(&pool, "game-1", "Balatro", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "440001").await;
    drop(pool);

    let db_str = db_path.to_str().unwrap();
    let yagl_bin = env!("CARGO_BIN_EXE_yagl");

    let inner_command = format!(
        "'{yagl_bin}' --db '{db_str}' status; sleep 0.1",
        yagl_bin = yagl_bin.replace('\'', r"'\''"),
        db_str = db_str.replace('\'', r"'\''"),
    );
    let command_line = format!("sh -lc '{inner_command}'");

    let mut child = Command::new("script")
        .args(["-qec", &command_line, "/dev/null"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // Select first game (Enter), then select first status option (Enter → Wishlist)
    child.stdin.as_mut().unwrap().write_all(b"\n\n").unwrap();
    drop(child.stdin.take());

    let out = child.wait_with_output().unwrap();
    let stdout = common::strip_ansi(&String::from_utf8_lossy(&out.stdout));
    let stderr = String::from_utf8_lossy(&out.stderr);

    assert!(out.status.success(), "stdout: {stdout}\nstderr: {stderr}");
    assert!(stdout.contains("Select a game"), "stdout: {stdout}");
    assert!(stdout.contains("Select a status"), "stdout: {stdout}");
    assert!(
        stdout.contains("Status for Balatro updated to"),
        "stdout: {stdout}"
    );

    let _ = std::fs::remove_file(&db_path);
}
