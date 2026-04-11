use anyhow::{bail, Context, Result};
use yagl_core::config::Config;
use yagl_core::db::DbPool;
use yagl_core::domains::game::models::{Game, GameLibraryEntry};
use yagl_core::domains::game::repository;
use yagl_core::domains::storefront::service as storefront_service;
use yagl_core::utils::storefront_label;

use crate::interactive;
use crate::utils::select_installed_game_id;

#[derive(Debug, Clone, PartialEq, Eq)]
struct UninstallTarget {
    game_name: String,
    entry_id: String,
    storefront_id: i64,
}

fn format_entry_label(entry: &GameLibraryEntry) -> String {
    let storefront = storefront_label(entry.storefront_id);
    let mut label = format!("{storefront} [{}]", entry.external_id);
    if let Some(location) = &entry.location {
        label.push_str(&format!(" - {location}"));
    }
    label
}

async fn load_game_and_entries(
    pool: &DbPool,
    game_id: &str,
) -> Result<(Game, Vec<GameLibraryEntry>)> {
    let game = repository::find_by_id(pool, game_id)
        .await
        .with_context(|| format!("game '{game_id}' not found"))?;
    let entries = repository::find_game_library_entries_by_game_id(pool, game_id)
        .await
        .with_context(|| format!("failed to load library entries for game '{game_id}'"))?;
    Ok((game, entries))
}

async fn resolve_uninstall_target(pool: &DbPool, game_id: &str) -> Result<UninstallTarget> {
    let (game, entries) = load_game_and_entries(pool, game_id).await?;
    resolve_uninstall_target_from_entries(&game, entries, |entries| {
        interactive::select(
            "Select a library entry to uninstall",
            entries,
            format_entry_label,
        )
    })
}

fn resolve_uninstall_target_from_entries<F>(
    game: &Game,
    entries: Vec<GameLibraryEntry>,
    select_entry: F,
) -> Result<UninstallTarget>
where
    F: FnOnce(&[GameLibraryEntry]) -> Result<&GameLibraryEntry>,
{
    let uninstallable_entries: Vec<GameLibraryEntry> = entries
        .into_iter()
        .filter(|entry| entry.is_installed)
        .collect();

    if uninstallable_entries.is_empty() {
        bail!(
            "no uninstallable library entries found for game '{}'",
            game.name
        );
    }

    let selected = if uninstallable_entries.len() == 1 {
        &uninstallable_entries[0]
    } else {
        select_entry(&uninstallable_entries)?
    };

    Ok(UninstallTarget {
        game_name: game.name.clone(),
        entry_id: selected.id.clone(),
        storefront_id: selected.storefront_id,
    })
}

pub async fn handle(pool: &DbPool, game_id: Option<String>, config: &Config) -> Result<()> {
    crate::utils::clear_screen()?;

    let game_id = select_installed_game_id(pool, game_id).await?;

    let target = resolve_uninstall_target(pool, &game_id).await?;

    let entry = repository::find_game_library_entry(pool, &target.entry_id)
        .await
        .with_context(|| format!("failed to load library entry '{}'", target.entry_id))?;

    storefront_service::uninstall_library_entry(config, &entry)
        .await
        .with_context(|| format!("failed to start uninstall for '{}'", target.game_name))?;

    println!("Request to uninstall {} has been sent.", target.game_name);

    Ok(())
}
