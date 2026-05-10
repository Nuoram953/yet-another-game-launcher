use anyhow::{Context, Result};
use yagl_core::db::DbPool;
use yagl_core::domains::game::models::GameStatus;
use yagl_core::domains::game::repository;

use crate::interactive;
use crate::utils::select_game_id;

const ALL_STATUSES: &[GameStatus] = &[
    GameStatus::Wishlist,
    GameStatus::Playing,
    GameStatus::Completed,
    GameStatus::Dropped,
    GameStatus::OnHold,
    GameStatus::ToDo,
];

fn status_label(s: &GameStatus) -> String {
    match s {
        GameStatus::Wishlist => "Wishlist".to_string(),
        GameStatus::Playing => "Playing".to_string(),
        GameStatus::Completed => "Completed".to_string(),
        GameStatus::Dropped => "Dropped".to_string(),
        GameStatus::OnHold => "On Hold".to_string(),
        GameStatus::ToDo => "To Do".to_string(),
    }
}

fn resolve_status(status: Option<String>) -> Result<GameStatus> {
    match status {
        Some(s) => {
            let matched = ALL_STATUSES.iter().find(|gs| {
                status_label(gs).eq_ignore_ascii_case(&s) || format!("{}", **gs as i64) == s
            });
            matched
                .copied()
                .ok_or_else(|| anyhow::anyhow!("unknown status '{s}'"))
        }
        None => {
            let selected = interactive::select("Select a status", ALL_STATUSES, status_label)?;
            Ok(*selected)
        }
    }
}

pub async fn handle(pool: &DbPool, game_id: Option<String>, status: Option<String>) -> Result<()> {
    crate::utils::clear_screen()?;

    let game_id = select_game_id(pool, game_id).await?;

    let game = repository::find_by_id(pool, &game_id)
        .await
        .with_context(|| format!("game '{game_id}' not found"))?;

    let new_status = resolve_status(status)?;

    repository::update_status(pool, &game_id, new_status as i64)
        .await
        .with_context(|| format!("failed to update status for '{}'", game.name))?;

    println!(
        "Status for {} updated to {}.",
        game.name,
        status_label(&new_status)
    );

    Ok(())
}
