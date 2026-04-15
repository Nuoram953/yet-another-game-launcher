use std::{
    collections::HashMap,
    fmt::{self, Write as _},
};

use anyhow::{Context, Result};
use colored::Colorize;
use yagl_core::domains::achievement::{
    models::{AchievementSet, GameAchievementData, GetGameAchievementSetsPayload},
    service as achievement_service,
};
use yagl_core::domains::game::{
    models::{Game, GameLaunch, GameLibraryEntry},
    repository,
};
use yagl_core::{
    config::Config,
    db::DbPool,
    utils::{
        format_playtime_minutes, format_playtime_seconds, format_size, format_timestamp,
        game_status_label, storefront_label,
    },
};

use crate::utils::select_game_id;

struct GameView {
    game: Game,
    entries: Vec<LibraryEntryView>,
    achievements: GameAchievementData,
}

struct LibraryEntryView {
    entry: GameLibraryEntry,
    launches: Vec<LaunchView>,
}

struct LaunchView {
    launch: GameLaunch,
    total_playtime_seconds: i64,
}

fn render_game_view(view: &GameView, show_achievements: bool) -> String {
    let mut output = String::new();
    let favorite = if view.game.is_favorite { " ★" } else { "" };

    writeln!(output, "\n{}{}", view.game.name.bold(), favorite.yellow())
        .expect("writing game name should not fail");
    writeln!(
        output,
        "{}",
        game_status_label(view.game.game_status_id).dimmed()
    )
    .expect("writing game status should not fail");

    if view.entries.is_empty() {
        writeln!(output, "\n{}", "No library entries found.".yellow())
            .expect("writing empty state should not fail");
        return output;
    }

    for entry in &view.entries {
        render_library_entry(&mut output, entry);
    }

    render_achievement_summary(&mut output, view, show_achievements);

    output.push('\n');
    output
}

fn render_library_entry(output: &mut String, entry: &LibraryEntryView) {
    let storefront = storefront_label(entry.entry.storefront_id);
    let dashes = "─".repeat(36usize.saturating_sub(storefront.len()));
    let installed = if entry.entry.is_installed {
        "Yes".green().to_string()
    } else {
        "No".red().to_string()
    };

    writeln!(output, "\n  {} {}", storefront.bold(), dashes.dimmed())
        .expect("writing storefront header should not fail");
    write_kv(output, "Installed", installed);

    if let Some(location) = &entry.entry.location {
        write_kv(output, "Location", location);
    }

    if let Some(size) = entry.entry.size {
        write_kv(output, "Size", format_size(size));
    }

    write_kv(
        output,
        "Playtime",
        format_playtime_minutes(entry.entry.time_played).bold(),
    );
    write_kv(
        output,
        "Last Played",
        entry
            .entry
            .last_played_at
            .map(format_timestamp)
            .unwrap_or_else(|| "Never".to_string()),
    );

    if entry.launches.is_empty() {
        return;
    }

    let dashes = "─".repeat(30);
    writeln!(output, "\n  {} {}", "Launches".bold(), dashes.dimmed())
        .expect("writing launches header should not fail");

    for launch in &entry.launches {
        render_launch(output, launch);
    }
}

fn render_launch(output: &mut String, launch: &LaunchView) {
    let default_marker = if launch.launch.is_default {
        format!(" {}", "[default]".green())
    } else {
        String::new()
    };

    writeln!(
        output,
        "    {}{}  {}",
        launch.launch.name.bold(),
        default_marker,
        format_playtime_seconds(launch.total_playtime_seconds).cyan()
    )
    .expect("writing launch summary should not fail");
}

fn render_achievement_summary(output: &mut String, view: &GameView, show_achievements: bool) {
    let dashes = "─".repeat(24);
    writeln!(output, "\n  {} {}", "Achievements".bold(), dashes.dimmed())
        .expect("writing achievements header should not fail");

    if view.achievements.sets.is_empty() {
        let status = if view.achievements.source_statuses.is_empty() {
            "Not synced yet".to_string()
        } else if view
            .achievements
            .source_statuses
            .iter()
            .all(|status| !status.has_achievements)
        {
            "No achievements found".to_string()
        } else {
            "No achievement sets found".to_string()
        };

        write_kv(output, "Status", status);
        return;
    }

    let total_unlocked = view
        .achievements
        .sets
        .iter()
        .map(|set| set.unlocked_achievements)
        .sum::<i64>();
    let total_achievements = view
        .achievements
        .sets
        .iter()
        .map(|set| set.total_achievements)
        .sum::<i64>();
    write_kv(
        output,
        "Progress",
        format!("{total_unlocked}/{total_achievements} unlocked").bold(),
    );
    write_kv(output, "Sets", view.achievements.sets.len());

    for set in &view.achievements.sets {
        render_achievement_set(output, view, set, show_achievements);
    }
}

fn render_achievement_set(
    output: &mut String,
    view: &GameView,
    set: &AchievementSet,
    show_achievements: bool,
) {
    writeln!(
        output,
        "\n  {}  {}",
        achievement_set_label(view, set).bold(),
        format!("{}/{}", set.unlocked_achievements, set.total_achievements).cyan()
    )
    .expect("writing achievement set summary should not fail");

    if !show_achievements {
        return;
    }

    for achievement in &set.achievements {
        let icon = if achievement.is_unlocked {
            "✓"
        } else {
            "○"
        };
        let unlocked_at = achievement
            .unlocked_at
            .map(|timestamp| format!("  {}", format_timestamp(timestamp).dimmed()))
            .unwrap_or_default();
        writeln!(
            output,
            "    {} {}{}",
            if achievement.is_unlocked {
                icon.green().to_string()
            } else {
                icon.dimmed().to_string()
            },
            achievement.name,
            unlocked_at
        )
        .expect("writing achievement row should not fail");
    }
}

fn achievement_set_label(view: &GameView, set: &AchievementSet) -> String {
    let mut label = set.name.clone();

    if !set.variant.is_empty() {
        label.push_str(&format!(" ({})", set.variant));
    }

    if let Some(launch_id) = &set.game_launch_id {
        if let Some(launch_name) = find_launch_name(view, launch_id) {
            label.push_str(&format!(" [{}]", launch_name));
        }
    }

    label
}

fn find_launch_name<'a>(view: &'a GameView, launch_id: &str) -> Option<&'a str> {
    view.entries
        .iter()
        .flat_map(|entry| entry.launches.iter())
        .find(|launch| launch.launch.id == launch_id)
        .map(|launch| launch.launch.name.as_str())
}

fn write_kv(output: &mut String, label: &str, value: impl fmt::Display) {
    writeln!(output, "  {}  {}", format!("{label:<12}").dimmed(), value)
        .expect("writing key value row should not fail");
}

async fn load_game_view(pool: &DbPool, game_id: &str) -> Result<GameView> {
    let game = repository::find_by_id(pool, game_id)
        .await
        .with_context(|| format!("game '{game_id}' not found"))?;
    let entries = repository::find_game_library_entries_by_game_id(pool, game_id)
        .await
        .with_context(|| format!("library entries for '{game_id}' not found"))?;
    let launches = repository::find_launches_for_game(pool, game_id)
        .await
        .with_context(|| format!("launches for '{game_id}' not found"))?;
    let achievements = achievement_service::get_game_achievement_sets(
        pool,
        GetGameAchievementSetsPayload {
            game_id: game_id.to_string(),
            game_launch_id: None,
        },
    )
    .await
    .with_context(|| format!("failed to load achievements for '{game_id}'"))?;

    Ok(GameView {
        game,
        entries: load_library_entry_views(pool, entries, launches).await?,
        achievements,
    })
}

async fn load_library_entry_views(
    pool: &DbPool,
    entries: Vec<GameLibraryEntry>,
    launches: Vec<GameLaunch>,
) -> Result<Vec<LibraryEntryView>> {
    let mut launches_by_entry = HashMap::<String, Vec<GameLaunch>>::new();
    for launch in launches {
        launches_by_entry
            .entry(launch.game_library_entry_id.clone())
            .or_default()
            .push(launch);
    }

    let mut entry_views = Vec::with_capacity(entries.len());
    for entry in entries {
        let launches = launches_by_entry.remove(&entry.id).unwrap_or_default();
        let launch_views = load_launch_views(pool, launches).await?;

        entry_views.push(LibraryEntryView {
            entry,
            launches: launch_views,
        });
    }

    Ok(entry_views)
}

async fn load_launch_views(pool: &DbPool, launches: Vec<GameLaunch>) -> Result<Vec<LaunchView>> {
    let mut launch_views = Vec::with_capacity(launches.len());

    for launch in launches {
        let total_playtime_seconds = repository::find_total_playtime_for_launch(pool, &launch.id)
            .await
            .with_context(|| format!("failed to load playtime for launch '{}'", launch.id))?;

        launch_views.push(LaunchView {
            launch,
            total_playtime_seconds,
        });
    }

    Ok(launch_views)
}

pub async fn handle(
    pool: &DbPool,
    game_id: Option<String>,
    achievements: bool,
    _: &Config,
) -> Result<()> {
    crate::utils::clear_screen()?;

    let game_id = select_game_id(pool, game_id).await?;
    let view = load_game_view(pool, &game_id).await?;

    print!("{}", render_game_view(&view, achievements));
    Ok(())
}
