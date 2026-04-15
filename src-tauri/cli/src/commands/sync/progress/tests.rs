use super::{
    header_dash_width, plain_render_line, RenderAction, StepUpdate, SyncStep, STEP_PREFIX_WIDTH,
};
use colored::Colorize;
use yagl_core::domains::storefront::{
    models::Storefront,
    service::{StorefrontAchievementSyncProgress, StorefrontSyncProgress, SyncProgressEvent},
};

#[test]
fn games_is_not_terminal_step() {
    assert!(!SyncStep::Games.is_terminal());
}

#[test]
fn achievements_is_terminal_step() {
    assert!(SyncStep::Achievements.is_terminal());
}

#[test]
fn storefront_started_maps_to_games_start() {
    assert_eq!(
        RenderAction::from_event(SyncProgressEvent::StorefrontStarted {
            storefront: Storefront::Steam,
        }),
        RenderAction::Step {
            storefront: Storefront::Steam,
            step: SyncStep::Games,
            update: StepUpdate::Start,
        }
    );
}

#[test]
fn achievement_completion_maps_to_achievement_finish() {
    assert_eq!(
        RenderAction::from_event(SyncProgressEvent::AchievementSyncCompleted {
            progress: StorefrontAchievementSyncProgress {
                storefront: Storefront::Steam,
                processed_games: 3,
                total_games: 5,
                games_with_achievements: 2,
                games_without_achievements: 1,
            },
        }),
        RenderAction::Step {
            storefront: Storefront::Steam,
            step: SyncStep::Achievements,
            update: StepUpdate::Finish {
                total: 5,
                processed: 3,
            },
        }
    );
}

#[test]
fn game_fetch_maps_to_games_fetch_total() {
    assert_eq!(
        RenderAction::from_event(SyncProgressEvent::StorefrontFetched {
            progress: StorefrontSyncProgress {
                storefront: Storefront::Steam,
                processed_games: 0,
                total_games: 7,
                games_added: 0,
                games_updated: 0,
            },
        }),
        RenderAction::Step {
            storefront: Storefront::Steam,
            step: SyncStep::Games,
            update: StepUpdate::Fetch { total: 7 },
        }
    );
}

#[test]
fn plain_output_skips_advance_updates() {
    assert_eq!(
        plain_render_line(SyncProgressEvent::GameProcessed {
            entry: None,
            progress: StorefrontSyncProgress {
                storefront: Storefront::Steam,
                processed_games: 2,
                total_games: 7,
                games_added: 0,
                games_updated: 0,
            },
        }),
        None
    );
}

#[test]
fn plain_output_formats_finish_updates() {
    assert_eq!(
        plain_render_line(SyncProgressEvent::AchievementSyncCompleted {
            progress: StorefrontAchievementSyncProgress {
                storefront: Storefront::Steam,
                processed_games: 3,
                total_games: 5,
                games_with_achievements: 2,
                games_without_achievements: 1,
            },
        }),
        Some(format!(
            "{} {} Achievements: completed 3/5",
            "✔".green().bold(),
            "Steam".bold()
        ))
    );
}

#[test]
fn header_dash_width_keeps_headers_aligned() {
    assert_eq!(
        header_dash_width("Steam") + "Steam".len() + 1,
        STEP_PREFIX_WIDTH
    );
    assert_eq!(
        header_dash_width("Custom") + "Custom".len() + 1,
        STEP_PREFIX_WIDTH
    );
}

#[test]
fn header_dash_width_keeps_at_least_one_dash() {
    assert_eq!(
        header_dash_width("A storefront label that is much longer than expected"),
        1
    );
}
