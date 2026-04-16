use async_trait::async_trait;
use sqlx::Row;
use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use yagl_core::{
    config::Config,
    domains::{
        achievement::models::{ImportedAchievement, ImportedAchievementSet},
        game::repository as game_repository,
        storefront::{
            models::{GameSyncStatus, Storefront, StorefrontGame},
            providers::StorefrontProvider,
            service::{
                sync_achievements_with_providers_observed, sync_with_providers,
                sync_with_providers_observed, sync_with_providers_tracked, SyncProgressEvent,
            },
        },
    },
    error::AppError,
    testing::db::test_db,
};

struct MockProvider {
    games: Vec<StorefrontGame>,
    achievement_games: HashSet<String>,
}

impl MockProvider {
    fn with_games(games: Vec<StorefrontGame>) -> Self {
        Self {
            games,
            achievement_games: HashSet::new(),
        }
    }

    fn with_achievement_games(games: Vec<StorefrontGame>, achievement_games: &[&str]) -> Self {
        Self {
            games,
            achievement_games: achievement_games
                .iter()
                .map(|id| (*id).to_string())
                .collect(),
        }
    }

    fn empty() -> Self {
        Self {
            games: vec![],
            achievement_games: HashSet::new(),
        }
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

    async fn fetch_achievement_set(
        &self,
        external_id: &str,
    ) -> Result<Option<ImportedAchievementSet>, AppError> {
        if !self.achievement_games.contains(external_id) {
            return Ok(None);
        }

        Ok(Some(ImportedAchievementSet {
            game_launch_id: None,
            storefront_id: Some(Storefront::Steam as i64),
            provider: "steam".to_string(),
            external_set_id: format!("set-{external_id}"),
            external_game_id: external_id.to_string(),
            variant: "default".to_string(),
            name: format!("Achievements {external_id}"),
            description: None,
            version: None,
            achievements: vec![ImportedAchievement {
                external_id: format!("achievement-{external_id}"),
                name: "First step".to_string(),
                description: None,
                icon_url: None,
                icon_gray_url: None,
                is_hidden: false,
                display_order: 0,
                is_unlocked: true,
                unlocked_at: Some(1_700_000_000),
            }],
        }))
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

#[tokio::test]
async fn sync_with_providers_observed_reports_storefront_progress() {
    let pool = test_db().await;
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> = vec![(
        Storefront::Steam,
        Box::new(MockProvider::with_games(vec![
            make_game("440", "Team Fortress 2"),
            make_game("570", "Dota 2"),
        ])),
    )];
    let events = Arc::new(Mutex::new(Vec::new()));
    let events_clone = Arc::clone(&events);

    sync_with_providers_observed(&pool, providers, &Config::default(), |event| {
        let label = match event {
            SyncProgressEvent::StorefrontStarted { storefront } => {
                format!("start:{storefront:?}")
            }
            SyncProgressEvent::StorefrontSkipped { storefront } => {
                format!("skipped:{storefront:?}")
            }
            SyncProgressEvent::StorefrontFetched { progress } => {
                format!("fetched:{:?}:{}", progress.storefront, progress.total_games)
            }
            SyncProgressEvent::GameProcessed { entry, progress } => format!(
                "processed:{:?}:{}:{}:{}",
                progress.storefront,
                progress.processed_games,
                progress.games_added,
                entry
                    .as_ref()
                    .map(|entry| entry.name.as_str())
                    .unwrap_or("unchanged")
            ),
            SyncProgressEvent::StorefrontCompleted { progress } => format!(
                "completed:{:?}:{}:{}",
                progress.storefront, progress.games_added, progress.games_updated
            ),
            SyncProgressEvent::AchievementSyncStarted { storefront } => {
                format!("achievement-start:{storefront:?}")
            }
            SyncProgressEvent::AchievementSyncFetched { progress } => format!(
                "achievement-fetched:{:?}:{}",
                progress.storefront, progress.total_games
            ),
            SyncProgressEvent::AchievementProcessed { progress } => format!(
                "achievement-processed:{:?}:{}:{}:{}",
                progress.storefront,
                progress.processed_games,
                progress.games_with_achievements,
                progress.games_without_achievements
            ),
            SyncProgressEvent::AchievementSyncCompleted { progress } => format!(
                "achievement-completed:{:?}:{}:{}",
                progress.storefront,
                progress.games_with_achievements,
                progress.games_without_achievements
            ),
        };

        events_clone.lock().unwrap().push(label);
    })
    .await
    .unwrap();

    let events = events.lock().unwrap();
    assert_eq!(events[0], "start:Steam");
    assert_eq!(events[1], "fetched:Steam:2");
    assert_eq!(events[2], "processed:Steam:1:1:Team Fortress 2");
    assert_eq!(events[3], "processed:Steam:2:2:Dota 2");
    assert_eq!(events[4], "completed:Steam:2:0");
}

#[tokio::test]
async fn sync_achievements_with_providers_observed_reports_progress() {
    let pool = test_db().await;

    sync_with_providers(
        &pool,
        vec![(
            Storefront::Steam,
            Box::new(MockProvider::with_games(vec![
                make_game("440", "Team Fortress 2"),
                make_game("570", "Dota 2"),
            ])) as Box<dyn StorefrontProvider>,
        )],
        &Config::default(),
    )
    .await
    .unwrap();

    let events = Arc::new(Mutex::new(Vec::new()));
    let events_clone = Arc::clone(&events);

    sync_achievements_with_providers_observed(
        &pool,
        vec![(
            Storefront::Steam,
            Box::new(MockProvider::with_achievement_games(vec![], &["440"]))
                as Box<dyn StorefrontProvider>,
        )],
        &Config::default(),
        |event| {
            let label = match event {
                SyncProgressEvent::AchievementSyncStarted { storefront } => {
                    format!("start:{storefront:?}")
                }
                SyncProgressEvent::AchievementSyncFetched { progress } => {
                    format!("fetched:{:?}:{}", progress.storefront, progress.total_games)
                }
                SyncProgressEvent::AchievementProcessed { progress } => format!(
                    "processed:{:?}:{}:{}:{}",
                    progress.storefront,
                    progress.processed_games,
                    progress.games_with_achievements,
                    progress.games_without_achievements
                ),
                SyncProgressEvent::AchievementSyncCompleted { progress } => format!(
                    "completed:{:?}:{}:{}",
                    progress.storefront,
                    progress.games_with_achievements,
                    progress.games_without_achievements
                ),
                other => panic!("unexpected event: {other:?}"),
            };

            events_clone.lock().unwrap().push(label);
        },
    )
    .await
    .unwrap();

    let events = events.lock().unwrap();
    assert_eq!(events[0], "start:Steam");
    assert_eq!(events[1], "fetched:Steam:2");
    assert_eq!(events[2], "processed:Steam:1:1:0");
    assert_eq!(events[3], "processed:Steam:2:1:1");
    assert_eq!(events[4], "completed:Steam:1:1");
}

#[tokio::test]
async fn sync_achievements_only_refreshes_games_played_since_last_check() {
    let pool = test_db().await;
    let now: i64 = sqlx::query_scalar!("SELECT unixepoch() AS value")
        .fetch_one(&pool)
        .await
        .unwrap();

    sync_with_providers(
        &pool,
        vec![(
            Storefront::Steam,
            Box::new(MockProvider::with_games(vec![
                StorefrontGame {
                    external_id: "440".to_string(),
                    name: "Team Fortress 2".to_string(),
                    is_installed: false,
                    location: String::new(),
                    size: None,
                    igdb_id: None,
                    time_played: Some(60),
                    last_played_at: Some((now - 10) as u64),
                },
                StorefrontGame {
                    external_id: "570".to_string(),
                    name: "Dota 2".to_string(),
                    is_installed: false,
                    location: String::new(),
                    size: None,
                    igdb_id: None,
                    time_played: Some(60),
                    last_played_at: Some((now - 200) as u64),
                },
            ])) as Box<dyn StorefrontProvider>,
        )],
        &Config::default(),
    )
    .await
    .unwrap();

    let recent_last_played = now - 10;
    let stale_last_played = now - 200;
    sqlx::query!(
        "UPDATE game_library_entry
         SET last_played_at = CASE external_id
             WHEN '440' THEN ?
             WHEN '570' THEN ?
             ELSE last_played_at
         END
         WHERE storefront_id = ?",
        recent_last_played,
        stale_last_played,
        Storefront::Steam as i64,
    )
    .execute(&pool)
    .await
    .unwrap();

    for external_id in ["440", "570"] {
        let entry =
            game_repository::find_by_external_id(&pool, Storefront::Steam as i64, external_id)
                .await
                .unwrap()
                .expect("expected synced library entry");
        let status_id = format!("status-{external_id}");
        let checked_at = now - 100;
        sqlx::query(
            "INSERT INTO achievement_source (
                id,
                game_id,
                storefront_id,
                provider,
                external_game_id,
                has_achievements,
                checked_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(status_id)
        .bind(entry.game_id)
        .bind(Storefront::Steam as i64)
        .bind("steam")
        .bind(external_id)
        .bind(false)
        .bind(checked_at)
        .execute(&pool)
        .await
        .unwrap();
    }

    let events = Arc::new(Mutex::new(Vec::new()));
    let events_clone = Arc::clone(&events);
    sync_achievements_with_providers_observed(
        &pool,
        vec![(
            Storefront::Steam,
            Box::new(MockProvider::with_achievement_games(vec![], &["440"]))
                as Box<dyn StorefrontProvider>,
        )],
        &Config::default(),
        |event| {
            if let SyncProgressEvent::AchievementProcessed { progress } = event {
                events_clone.lock().unwrap().push(format!(
                    "{}:{}:{}",
                    progress.processed_games,
                    progress.games_with_achievements,
                    progress.games_without_achievements
                ));
            }
        },
    )
    .await
    .unwrap();

    let statuses = sqlx::query(
        "SELECT external_game_id, has_achievements, checked_at
         FROM achievement_source
         WHERE provider = 'steam'
         ORDER BY external_game_id",
    )
    .fetch_all(&pool)
    .await
    .unwrap();

    assert_eq!(statuses.len(), 2);
    let refreshed = statuses
        .iter()
        .find(|status| status.get::<String, _>("external_game_id") == "440")
        .expect("expected refreshed status");
    assert!(refreshed.get::<bool, _>("has_achievements"));
    assert!(refreshed.get::<i64, _>("checked_at") > now - 100);

    let skipped = statuses
        .iter()
        .find(|status| status.get::<String, _>("external_game_id") == "570")
        .expect("expected skipped status");
    assert!(!skipped.get::<bool, _>("has_achievements"));
    assert_eq!(skipped.get::<i64, _>("checked_at"), now - 100);

    let events = events.lock().unwrap();
    assert_eq!(events.as_slice(), ["1:1:0"]);
}
