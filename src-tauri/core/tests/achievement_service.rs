use yagl_core::{
    domains::achievement::{
        models::{GetGameAchievementSetsPayload, ImportedAchievement, ImportedAchievementSet},
        service,
    },
    testing::{
        db::test_db,
        fixtures::{insert_game, insert_game_launch, insert_game_library_entry},
    },
};

fn imported_set(
    name: &str,
    version: &str,
    achievements: Vec<ImportedAchievement>,
) -> ImportedAchievementSet {
    ImportedAchievementSet {
        game_launch_id: None,
        storefront_id: Some(1),
        provider: "steam".to_string(),
        external_set_id: "440".to_string(),
        external_game_id: "440".to_string(),
        variant: String::new(),
        name: name.to_string(),
        description: None,
        version: Some(version.to_string()),
        achievements,
    }
}

fn imported_achievement(
    external_id: &str,
    name: &str,
    display_order: i64,
    is_unlocked: bool,
    unlocked_at: Option<i64>,
) -> ImportedAchievement {
    ImportedAchievement {
        external_id: external_id.to_string(),
        name: name.to_string(),
        description: Some(format!("description for {external_id}")),
        icon_url: Some(format!("https://example.com/{external_id}.png")),
        icon_gray_url: Some(format!("https://example.com/{external_id}-gray.png")),
        is_hidden: false,
        display_order,
        is_unlocked,
        unlocked_at,
    }
}

#[tokio::test]
async fn sync_imported_set_persists_sets_achievements_and_unlock_state() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Team Fortress 2", 6).await;
    let entry = insert_game_library_entry(&pool, "entry-1", &game.id, "440").await;

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        imported_set(
            "Steam achievements",
            "1",
            vec![
                imported_achievement("ACH_WIN_ONE_GAME", "Winner", 0, true, Some(1_700_000_000)),
                imported_achievement("ACH_WIN_TEN_GAMES", "Veteran", 1, false, None),
            ],
        ),
    )
    .await
    .unwrap();

    let sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(sets.source_statuses.len(), 1);
    assert!(sets.source_statuses[0].has_achievements);
    assert_eq!(sets.sets.len(), 1);
    let set = &sets.sets[0];
    assert_eq!(set.name, "Steam achievements");
    assert_eq!(set.version.as_deref(), Some("1"));
    assert_eq!(set.total_achievements, 2);
    assert_eq!(set.unlocked_achievements, 1);
    assert_eq!(set.achievements.len(), 2);
    assert!(set.achievements[0].is_unlocked);
    assert_eq!(set.achievements[0].unlocked_at, Some(1_700_000_000));
    assert!(!set.achievements[1].is_unlocked);
}

#[tokio::test]
async fn sync_imported_set_updates_existing_rows_and_removes_stale_ones() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Team Fortress 2", 6).await;
    let entry = insert_game_library_entry(&pool, "entry-1", &game.id, "440").await;

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        imported_set(
            "Steam achievements",
            "1",
            vec![
                imported_achievement("ACH_WIN_ONE_GAME", "Winner", 0, true, Some(1_700_000_000)),
                imported_achievement("ACH_WIN_TEN_GAMES", "Veteran", 1, false, None),
            ],
        ),
    )
    .await
    .unwrap();

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        imported_set(
            "Steam achievements v2",
            "2",
            vec![imported_achievement(
                "ACH_WIN_ONE_GAME",
                "Winner+",
                0,
                false,
                None,
            )],
        ),
    )
    .await
    .unwrap();

    let sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(sets.source_statuses.len(), 1);
    assert!(sets.source_statuses[0].has_achievements);
    assert_eq!(sets.sets.len(), 1);
    let set = &sets.sets[0];
    assert_eq!(set.name, "Steam achievements v2");
    assert_eq!(set.version.as_deref(), Some("2"));
    assert_eq!(set.total_achievements, 1);
    assert_eq!(set.unlocked_achievements, 0);
    assert_eq!(set.achievements[0].name, "Winner+");

    let achievement_count: i64 =
        sqlx::query_scalar("SELECT COUNT(*) FROM achievement WHERE achievement_set_id = ?")
            .bind(&set.id)
            .fetch_one(&pool)
            .await
            .unwrap();
    assert_eq!(achievement_count, 1);

    let unlocked_state: i64 =
        sqlx::query_scalar("SELECT is_unlocked FROM achievement WHERE achievement_set_id = ?")
            .bind(&set.id)
            .fetch_one(&pool)
            .await
            .unwrap();
    assert_eq!(unlocked_state, 0);
}

#[tokio::test]
async fn get_game_achievement_sets_returns_current_unlock_state() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Team Fortress 2", 6).await;
    let entry = insert_game_library_entry(&pool, "entry-1", &game.id, "440").await;

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        imported_set(
            "Steam achievements",
            "1",
            vec![imported_achievement(
                "ACH_WIN_ONE_GAME",
                "Winner",
                0,
                true,
                Some(1_700_000_000),
            )],
        ),
    )
    .await
    .unwrap();

    let sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(sets.source_statuses.len(), 1);
    assert!(sets.source_statuses[0].has_achievements);
    assert_eq!(sets.sets.len(), 1);
    assert_eq!(sets.sets[0].total_achievements, 1);
    assert_eq!(sets.sets[0].unlocked_achievements, 1);
    assert!(sets.sets[0].achievements[0].is_unlocked);
    assert_eq!(
        sets.sets[0].achievements[0].unlocked_at,
        Some(1_700_000_000)
    );
}

#[tokio::test]
async fn get_game_achievement_sets_without_entry_still_returns_unlock_state() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Team Fortress 2", 6).await;
    let entry = insert_game_library_entry(&pool, "entry-1", &game.id, "440").await;

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        imported_set(
            "Steam achievements",
            "1",
            vec![imported_achievement(
                "ACH_WIN_ONE_GAME",
                "Winner",
                0,
                true,
                Some(1_700_000_000),
            )],
        ),
    )
    .await
    .unwrap();

    let sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(sets.source_statuses.len(), 1);
    assert!(sets.source_statuses[0].has_achievements);
    assert_eq!(sets.sets.len(), 1);
    assert_eq!(sets.sets[0].total_achievements, 1);
    assert_eq!(sets.sets[0].unlocked_achievements, 1);
    assert!(sets.sets[0].achievements[0].is_unlocked);
    assert_eq!(
        sets.sets[0].achievements[0].unlocked_at,
        Some(1_700_000_000)
    );
}

#[tokio::test]
async fn get_game_achievement_sets_can_scope_to_launch_and_include_global_sets() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Metroid", 6).await;
    let entry = insert_game_library_entry(&pool, "entry-1", &game.id, "metroid").await;
    let default_launch =
        insert_game_launch(&pool, "launch-default", &entry.id, Some("/emu/default")).await;
    let fan_launch = insert_game_launch(&pool, "launch-fan", &entry.id, Some("/emu/fan")).await;

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        ImportedAchievementSet {
            game_launch_id: None,
            storefront_id: Some(0),
            provider: "retroachievements".to_string(),
            external_set_id: "metroid-global".to_string(),
            external_game_id: "metroid-global".to_string(),
            variant: String::new(),
            name: "Metroid".to_string(),
            description: None,
            version: Some("1".to_string()),
            achievements: vec![imported_achievement("GLOBAL", "Global", 0, true, Some(10))],
        },
    )
    .await
    .unwrap();

    service::sync_imported_set(
        &pool,
        &game.id,
        &entry,
        ImportedAchievementSet {
            game_launch_id: Some(fan_launch.id.clone()),
            storefront_id: Some(0),
            provider: "retroachievements".to_string(),
            external_set_id: "metroid-fan".to_string(),
            external_game_id: "metroid-fan".to_string(),
            variant: "fan".to_string(),
            name: "Metroid Fan Edition".to_string(),
            description: None,
            version: Some("1".to_string()),
            achievements: vec![imported_achievement("FAN", "Fan", 0, false, None)],
        },
    )
    .await
    .unwrap();

    let default_sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: Some(default_launch.id.clone()),
        },
    )
    .await
    .unwrap();

    assert_eq!(default_sets.source_statuses.len(), 1);
    assert!(default_sets.source_statuses[0].has_achievements);
    assert_eq!(default_sets.sets.len(), 1);
    assert_eq!(default_sets.sets[0].game_launch_id, None);
    assert_eq!(default_sets.sets[0].name, "Metroid");

    let fan_sets = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: Some(fan_launch.id.clone()),
        },
    )
    .await
    .unwrap();

    assert_eq!(fan_sets.source_statuses.len(), 2);
    assert!(fan_sets
        .source_statuses
        .iter()
        .any(|status| status.game_launch_id.is_none() && status.has_achievements));
    assert!(fan_sets
        .source_statuses
        .iter()
        .any(
            |status| status.game_launch_id.as_deref() == Some(fan_launch.id.as_str())
                && status.has_achievements
        ));
    assert_eq!(fan_sets.sets.len(), 2);
    assert!(fan_sets
        .sets
        .iter()
        .any(|set| set.game_launch_id.is_none() && set.name == "Metroid"));
    assert!(fan_sets.sets.iter().any(|set| set.game_launch_id.as_deref()
        == Some(fan_launch.id.as_str())
        && set.name == "Metroid Fan Edition"));
}

#[tokio::test]
async fn mark_source_checked_records_no_achievements_state() {
    let pool = test_db().await;
    let game = insert_game(&pool, "game-1", "Half-Life", 6).await;

    service::mark_source_checked(
        &pool,
        yagl_core::domains::achievement::models::NewAchievementSourceStatus {
            id: "status-1".to_string(),
            game_id: game.id.clone(),
            game_launch_id: None,
            storefront_id: Some(1),
            provider: "steam".to_string(),
            external_game_id: "70".to_string(),
            has_achievements: false,
        },
    )
    .await
    .unwrap();

    let result = service::get_game_achievement_sets(
        &pool,
        GetGameAchievementSetsPayload {
            game_id: game.id.clone(),
            game_launch_id: None,
        },
    )
    .await
    .unwrap();

    assert!(result.sets.is_empty());
    assert_eq!(result.source_statuses.len(), 1);
    assert!(!result.source_statuses[0].has_achievements);
    assert_eq!(result.source_statuses[0].provider, "steam");
    assert_eq!(result.source_statuses[0].external_game_id, "70");
}
