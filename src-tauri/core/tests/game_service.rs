use async_trait::async_trait;
use tokio::time::{sleep, Duration};
use yagl_core::{
    config::Config,
    domains::{
        game::{models::SearchGamePayload, repository, service},
        storefront::{models::StorefrontGame, providers::StorefrontProvider},
    },
    error::AppError,
    testing::{
        db::test_db,
        fixtures::{insert_game, insert_game_launch, insert_game_library_entry},
    },
};

struct MockProvider {
    session: Option<(i64, i64)>,
}

impl MockProvider {
    fn with_session(started_at: i64, ended_at: i64) -> Self {
        Self {
            session: Some((started_at, ended_at)),
        }
    }

    fn untrackable() -> Self {
        Self { session: None }
    }
}

#[async_trait]
impl StorefrontProvider for MockProvider {
    fn is_enabled(&self, _config: &Config) -> bool {
        true
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError> {
        Ok(vec![])
    }

    async fn launch_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn track_session(&self, _external_id: &str) -> Option<(i64, i64)> {
        self.session
    }

    async fn install_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn uninstall_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
}

#[tokio::test]
async fn track_with_finder_detects_and_tracks_real_process() {
    let mut child = tokio::process::Command::new("sleep")
        .arg("0.3")
        .spawn()
        .expect("failed to spawn test process");

    let pid_raw = child.id().expect("process should have a pid");
    let pid = sysinfo::Pid::from(pid_raw as usize);

    let result = yagl_core::domains::storefront::steam::service::track_with_finder(
        move || {
            // Check /proc/<pid>/status State field; 'Z' = zombie (exited, not yet reaped)
            let status = std::fs::read_to_string(format!("/proc/{pid_raw}/status")).ok()?;
            let state = status
                .lines()
                .find(|l| l.starts_with("State:"))?
                .split_whitespace()
                .nth(1)?
                .chars()
                .next()?;
            if state == 'Z' || state == 'X' {
                None
            } else {
                Some(pid)
            }
        },
        Duration::from_millis(50),
        Duration::from_millis(50),
    )
    .await;

    child.wait().await.ok();

    let (started_at, ended_at) = result.expect("should return timestamps");
    assert!(ended_at >= started_at, "ended_at must be >= started_at");
    assert!(started_at > 0, "started_at should be a real Unix timestamp");
}

#[tokio::test]
async fn track_with_finder_returns_none_when_process_not_found() {
    use std::sync::{Arc, Mutex};
    let calls = Arc::new(Mutex::new(0u32));

    let result = tokio::time::timeout(
        Duration::from_millis(500),
        yagl_core::domains::storefront::steam::service::track_with_finder(
            move || {
                let mut n = calls.lock().unwrap();
                *n += 1;
                None
            },
            Duration::from_millis(10),
            Duration::from_millis(10),
        ),
    )
    .await;

    assert!(result.is_err(), "should still be searching after 500ms");
}

#[tokio::test]
async fn launch_custom_exe_and_track_inserts_activity_in_db() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, Some("echo")).await;

    service::launch_custom_exe_and_track(&pool, &launch, &entry, "echo")
        .await
        .unwrap();

    let count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM game_activity WHERE game_launch_id = ?",
        launch.id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(count, 1);
}

#[tokio::test]
async fn launch_custom_exe_and_track_records_correct_timestamps() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, Some("sleep")).await;

    let launch_with_args = yagl_core::domains::game::repository::insert_game_launch(
        &pool,
        &yagl_core::domains::game::models::NewGameLaunch {
            id: "l2".to_string(),
            game_library_entry_id: entry.id.clone(),
            name: "Sleep".to_string(),
            executable: Some("sleep".to_string()),
            args: Some("0.2".to_string()),
            working_dir: None,
            is_default: false,
            env: None,
            proton_dir: None,
        },
    )
    .await
    .unwrap();

    let before = chrono::Utc::now().timestamp();
    service::launch_custom_exe_and_track(&pool, &launch_with_args, &entry, "sleep")
        .await
        .unwrap();
    let after = chrono::Utc::now().timestamp();

    let row = sqlx::query!(
        "SELECT started_at, ended_at, duration FROM game_activity WHERE game_launch_id = ?",
        launch_with_args.id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert!(row.started_at >= before);
    assert!(row.ended_at <= after + 1);
    assert!(row.duration >= 0);

    drop(launch);
}

#[tokio::test]
async fn launch_custom_exe_and_track_returns_error_on_bad_exe() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, Some("/nonexistent/binary")).await;

    let result =
        service::launch_custom_exe_and_track(&pool, &launch, &entry, "/nonexistent/binary").await;

    assert!(
        matches!(result, Err(AppError::Launch(_))),
        "expected Launch error, got {result:?}"
    );
}

#[tokio::test]
async fn launch_storefront_and_track_inserts_activity_via_mock_provider() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, None).await;

    let provider = Box::new(MockProvider::with_session(1000, 4600));

    service::launch_storefront_and_track(&pool, &launch, &entry.external_id, provider)
        .await
        .unwrap();

    sleep(Duration::from_millis(100)).await;

    let row = sqlx::query!(
        "SELECT started_at, ended_at, duration FROM game_activity WHERE game_launch_id = ?",
        launch.id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(row.started_at, 1000);
    assert_eq!(row.ended_at, 4600);
    assert_eq!(row.duration, 3600);
}

#[tokio::test]
async fn launch_storefront_and_track_skips_activity_when_tracking_fails() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, None).await;

    let provider = Box::new(MockProvider::untrackable());

    service::launch_storefront_and_track(&pool, &launch, &entry.external_id, provider)
        .await
        .unwrap();

    sleep(Duration::from_millis(100)).await;

    let count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM game_activity WHERE game_launch_id = ?",
        launch.id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(count, 0);
}

#[tokio::test]
async fn launch_storefront_and_track_skips_zero_duration_session() {
    let pool = test_db().await;
    insert_game(&pool, "g1", "Test Game", 1).await;
    let entry = insert_game_library_entry(&pool, "e1", "g1", "111").await;
    let launch = insert_game_launch(&pool, "l1", &entry.id, None).await;

    let provider = Box::new(MockProvider::with_session(1000, 1000));

    service::launch_storefront_and_track(&pool, &launch, &entry.external_id, provider)
        .await
        .unwrap();

    let count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM game_activity WHERE game_launch_id = ?",
        launch.id
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(count, 0);
}

#[tokio::test]
async fn search_game_no_name_returns_all_games() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Half-Life 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;

    let games = service::search_game(
        &pool,
        SearchGamePayload {
            name: None,
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 2);
}

#[tokio::test]
async fn search_game_with_name_returns_matching_game() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Half-Life 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;

    let games = service::search_game(
        &pool,
        SearchGamePayload {
            name: Some("portal".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].id, "game-1");
    assert_eq!(games[0].name, "Portal");
}

#[tokio::test]
async fn search_game_with_non_matching_name_returns_empty() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;

    let games = service::search_game(
        &pool,
        SearchGamePayload {
            name: Some("halo".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert!(games.is_empty());
}

#[tokio::test]
async fn search_game_with_partial_name_returns_multiple_matches() {
    let pool = test_db().await;
    repository::insert_game(&pool, "game-1", "Portal", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-2", "Portal 2", None)
        .await
        .unwrap();
    repository::insert_game(&pool, "game-3", "Half-Life 2", None)
        .await
        .unwrap();
    insert_game_library_entry(&pool, "entry-1", "game-1", "111").await;
    insert_game_library_entry(&pool, "entry-2", "game-2", "222").await;
    insert_game_library_entry(&pool, "entry-3", "game-3", "333").await;

    let games = service::search_game(
        &pool,
        SearchGamePayload {
            name: Some("portal".to_string()),
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(games.len(), 2);
    let ids: Vec<&str> = games.iter().map(|g| g.id.as_str()).collect();
    assert!(ids.contains(&"game-1"));
    assert!(ids.contains(&"game-2"));
}

#[tokio::test]
async fn search_game_returns_empty_on_empty_db() {
    let pool = test_db().await;

    let games = service::search_game(
        &pool,
        SearchGamePayload {
            name: None,
            has_any_installed: None,
        },
    )
    .await
    .unwrap();

    assert!(games.is_empty());
}
