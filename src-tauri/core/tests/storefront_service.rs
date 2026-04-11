use async_trait::async_trait;
use std::sync::{Arc, Mutex};
use yagl_core::{
    config::Config,
    domains::{
        game::repository as game_repository,
        storefront::{
            models::{GameSyncStatus, Storefront, StorefrontGame},
            providers::StorefrontProvider,
            service::{sync_with_providers, sync_with_providers_tracked},
        },
    },
    error::AppError,
    testing::db::test_db,
};

struct MockProvider {
    games: Vec<StorefrontGame>,
}

impl MockProvider {
    fn with_games(games: Vec<StorefrontGame>) -> Self {
        Self { games }
    }

    fn empty() -> Self {
        Self { games: vec![] }
    }
}

#[async_trait]
impl StorefrontProvider for MockProvider {
    fn is_enabled(&self, _config: &Config) -> bool {
        true
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError> {
        Ok(self
            .games
            .iter()
            .map(|g| StorefrontGame {
                external_id: g.external_id.clone(),
                name: g.name.clone(),
                is_installed: g.is_installed,
                location: g.location.clone(),
                size: g.size,
                igdb_id: g.igdb_id,
                time_played: g.time_played,
                last_played_at: g.last_played_at,
            })
            .collect())
    }

    async fn launch_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn track_session(&self, _external_id: &str) -> Option<(i64, i64)> {
        None
    }

    async fn install_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn uninstall_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
}

struct FailingProvider;

#[async_trait]
impl StorefrontProvider for FailingProvider {
    fn is_enabled(&self, _config: &Config) -> bool {
        true
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError> {
        Err(AppError::Steam("provider error".into()))
    }

    async fn launch_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn track_session(&self, _external_id: &str) -> Option<(i64, i64)> {
        None
    }

    async fn install_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
    async fn uninstall_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
}

struct DisabledProvider;

#[async_trait]
impl StorefrontProvider for DisabledProvider {
    fn is_enabled(&self, _config: &Config) -> bool {
        false
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError> {
        panic!("sync_library must not be called on a disabled provider")
    }

    async fn launch_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }

    async fn track_session(&self, _external_id: &str) -> Option<(i64, i64)> {
        None
    }

    async fn install_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
    async fn uninstall_game(&self, _external_id: &str) -> Result<(), AppError> {
        Ok(())
    }
}

fn make_game(external_id: &str, name: &str) -> StorefrontGame {
    StorefrontGame {
        external_id: external_id.to_string(),
        name: name.to_string(),
        is_installed: false,
        location: String::new(),
        size: None,
        igdb_id: None,
        time_played: None,
        last_played_at: None,
    }
}

#[tokio::test]
async fn sync_with_providers_inserts_new_games() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];

    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 2);
    assert_eq!(result.games_updated, 0);
}

#[tokio::test]
async fn sync_with_providers_skips_existing_games() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 0);
    assert_eq!(result.games_updated, 0);
}

#[tokio::test]
async fn sync_with_providers_adds_new_and_skips_existing() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "440",
            "Team Fortress 2",
        )])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 1);
    assert_eq!(result.games_updated, 0);
}

#[tokio::test]
async fn sync_with_providers_creates_game_and_library_entry_and_launch() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "440",
            "Team Fortress 2",
        )])),
    )];

    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let game_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(game_count, 1);

    let entry_count: i64 =
        sqlx::query_scalar!("SELECT COUNT(*) FROM game_library_entry WHERE external_id = '440'")
            .fetch_one(&pool)
            .await
            .unwrap();
    assert_eq!(entry_count, 1);

    let launch_count: i64 = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM game_launch gl
         JOIN game_library_entry gle ON gle.id = gl.game_library_entry_id
         WHERE gle.external_id = '440'"
    )
    .fetch_one(&pool)
    .await
    .unwrap();
    assert_eq!(launch_count, 1);
}

#[tokio::test]
async fn sync_with_providers_persists_install_state_for_new_games() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: true,
            location: "/games/team-fortress-2".to_string(),
            size: Some(4_242),
            igdb_id: None,
            time_played: None,
            last_played_at: None,
        }])),
    )];

    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let entry = game_repository::find_by_external_id(&pool, 1, "440")
        .await
        .unwrap()
        .expect("expected library entry");
    assert!(entry.is_installed);
    assert_eq!(entry.location.as_deref(), Some("/games/team-fortress-2"));
    assert_eq!(entry.size, Some(4_242));
}

#[tokio::test]
async fn sync_with_providers_new_game_has_todo_status() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "440",
            "Team Fortress 2",
        )])),
    )];

    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let status: i64 =
        sqlx::query_scalar!("SELECT game_status_id FROM game WHERE name = 'Team Fortress 2'")
            .fetch_one(&pool)
            .await
            .unwrap();
    assert_eq!(status, 6);
}

#[tokio::test]
async fn sync_with_providers_new_launch_is_default_and_has_no_executable() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "440",
            "Team Fortress 2",
        )])),
    )];

    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let row = sqlx::query!(
        "SELECT gl.is_default, gl.executable FROM game_launch gl
         JOIN game_library_entry gle ON gle.id = gl.game_library_entry_id
         WHERE gle.external_id = '440'"
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert!(row.is_default);
    assert!(row.executable.is_none());
}

#[tokio::test]
async fn sync_with_providers_empty_library_returns_zero_counts() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(MockProvider::empty()))];

    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 0);
    assert_eq!(result.games_updated, 0);
}

#[tokio::test]
async fn sync_with_providers_propagates_provider_error() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(FailingProvider))];

    let result = sync_with_providers(&pool, providers, &Config::default()).await;

    assert!(
        matches!(result, Err(AppError::Steam(_))),
        "expected Steam error from failing provider, got {result:?}"
    );
}

#[tokio::test]
async fn sync_with_providers_reuses_existing_game_row_when_normalized_name_matches() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "440",
            "Team Fortress 2",
        )])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let game_count_after_first: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(game_count_after_first, 1);

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Custom,
        Box::new(MockProvider::with_games(vec![make_game(
            "tf2-custom",
            "Team Fortress 2 ",
        )])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 1);
    assert_eq!(result.games_updated, 0);

    let game_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(game_count, 1, "should not create a duplicate game row");

    let entry_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game_library_entry")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(entry_count, 2);

    let launch_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game_launch")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(launch_count, 2);
}

#[tokio::test]
async fn sync_with_providers_reuses_game_row_when_name_has_punctuation_differences() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![make_game(
            "200",
            "Batman: Arkham City",
        )])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Custom,
        Box::new(MockProvider::with_games(vec![make_game(
            "batman-ac",
            "Batman Arkham City",
        )])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let game_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(
        game_count, 1,
        "should reuse game row despite punctuation difference"
    );
}

#[tokio::test]
async fn sync_with_providers_does_not_merge_distinct_games() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("400", "Portal"),
            make_game("620", "Portal 2"),
        ])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 2);

    let game_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(
        game_count, 2,
        "Portal and Portal 2 must remain separate game rows"
    );
}

#[tokio::test]
async fn sync_with_providers_skips_disabled_storefront() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        vec![(Storefront::Steam, Box::new(DisabledProvider))];

    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_added, 0);
    assert_eq!(result.games_updated, 0);

    let game_count: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM game")
        .fetch_one(&pool)
        .await
        .unwrap();
    assert_eq!(
        game_count, 0,
        "no games should be inserted for a disabled storefront"
    );
}

#[tokio::test]
async fn sync_with_providers_updates_time_played_when_changed() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: false,
            location: String::new(),
            size: None,
            igdb_id: None,
            time_played: Some(60),
            last_played_at: None,
        }])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: false,
            location: String::new(),
            size: None,
            igdb_id: None,
            time_played: Some(120),
            last_played_at: None,
        }])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_updated, 1, "should report one updated game");
    assert_eq!(result.games_added, 0);
}

#[tokio::test]
async fn sync_with_providers_updates_install_state_when_changed() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: true,
            location: "/games/team-fortress-2".to_string(),
            size: Some(4_242),
            igdb_id: None,
            time_played: None,
            last_played_at: None,
        }])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: false,
            location: String::new(),
            size: None,
            igdb_id: None,
            time_played: None,
            last_played_at: None,
        }])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let entry = game_repository::find_by_external_id(&pool, 1, "440")
        .await
        .unwrap()
        .expect("expected library entry");
    assert_eq!(result.games_updated, 1);
    assert!(!entry.is_installed);
    assert_eq!(entry.location, None);
    assert_eq!(entry.size, None);
}

#[tokio::test]
async fn sync_with_providers_no_update_when_time_played_unchanged() {
    let pool = test_db().await;

    let make_providers = || {
        vec![(
            Storefront::Steam,
            Box::new(MockProvider::with_games(vec![StorefrontGame {
                external_id: "440".to_string(),
                name: "Team Fortress 2".to_string(),
                is_installed: false,
                location: String::new(),
                size: None,
                igdb_id: None,
                time_played: Some(60),
                last_played_at: None,
            }])) as Box<dyn StorefrontProvider>,
        )]
    };

    sync_with_providers(&pool, make_providers(), &Config::default())
        .await
        .unwrap();

    let result = sync_with_providers(&pool, make_providers(), &Config::default())
        .await
        .unwrap();

    assert_eq!(
        result.games_updated, 0,
        "no update when time_played is the same"
    );
    assert_eq!(result.games_added, 0);
}

#[tokio::test]
async fn sync_with_providers_updates_last_played_when_changed() {
    let pool = test_db().await;

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: false,
            location: String::new(),
            size: None,
            igdb_id: None,
            time_played: Some(60),
            last_played_at: Some(1_700_000_000),
        }])),
    )];
    sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![StorefrontGame {
            external_id: "440".to_string(),
            name: "Team Fortress 2".to_string(),
            is_installed: false,
            location: String::new(),
            size: None,
            igdb_id: None,
            time_played: Some(60),
            last_played_at: Some(1_700_000_123),
        }])),
    )];
    let result = sync_with_providers(&pool, providers, &Config::default())
        .await
        .unwrap();

    assert_eq!(result.games_updated, 1, "should report one updated game");
    assert_eq!(result.games_added, 0);
}

#[tokio::test]
async fn sync_with_providers_tracked_invokes_callback_for_each_added_game() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];

    let collected: Arc<Mutex<Vec<(String, GameSyncStatus)>>> = Arc::new(Mutex::new(Vec::new()));
    let collected_clone = Arc::clone(&collected);

    sync_with_providers_tracked(&pool, providers, &Config::default(), |entry| {
        collected_clone
            .lock()
            .unwrap()
            .push((entry.name.clone(), entry.status));
    })
    .await
    .unwrap();

    let entries = collected.lock().unwrap();
    assert_eq!(
        entries.len(),
        2,
        "callback should be called once per added game"
    );
    assert!(entries.iter().all(|(_, s)| *s == GameSyncStatus::Added));
}
