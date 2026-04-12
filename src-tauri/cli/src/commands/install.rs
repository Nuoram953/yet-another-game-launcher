use anyhow::{bail, Context, Result};
use colored::Colorize;
use indicatif::ProgressBar;
use tokio::time::{sleep, Duration};
use yagl_core::{
    config::Config,
    db::DbPool,
    domains::{
        game::{
            models::{Game, GameLibraryEntry},
            repository,
        },
        storefront::{models::InstallProgress, service as storefront_service},
    },
    utils::{format_size, storefront_label},
};

use crate::{
    interactive, progress,
    utils::{clear_screen, select_game_id},
};

const FOLLOW_POLL_INTERVAL: Duration = Duration::from_millis(200);
const FOLLOW_WAIT_POLLS: usize = 100;
const FOLLOW_STALLED_POLLS: usize = 50;

#[derive(Debug, Clone, PartialEq, Eq)]
struct InstallTarget {
    game_name: String,
    entry_id: String,
    storefront_id: i64,
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

fn format_entry_label(entry: &GameLibraryEntry) -> String {
    let storefront = storefront_label(entry.storefront_id);
    let mut label = format!("{storefront} [{}]", entry.external_id);
    if let Some(location) = &entry.location {
        label.push_str(&format!(" - {location}"));
    }
    label
}

fn resolve_install_target_from_entries<F>(
    game: &Game,
    entries: Vec<GameLibraryEntry>,
    select_entry: F,
) -> Result<InstallTarget>
where
    F: FnOnce(&[GameLibraryEntry]) -> Result<&GameLibraryEntry>,
{
    let installable_entries: Vec<GameLibraryEntry> = entries
        .into_iter()
        .filter(|entry| !entry.is_installed)
        .collect();

    if installable_entries.is_empty() {
        bail!(
            "no installable library entries found for game '{}'",
            game.name
        );
    }

    let selected = if installable_entries.len() == 1 {
        &installable_entries[0]
    } else {
        select_entry(&installable_entries)?
    };

    Ok(InstallTarget {
        game_name: game.name.clone(),
        entry_id: selected.id.clone(),
        storefront_id: selected.storefront_id,
    })
}

async fn resolve_install_target(pool: &DbPool, game_id: &str) -> Result<InstallTarget> {
    let (game, entries) = load_game_and_entries(pool, game_id).await?;
    resolve_install_target_from_entries(&game, entries, |entries| {
        interactive::select(
            "Select a library entry to install",
            entries,
            format_entry_label,
        )
    })
}

fn build_progress_bar() -> ProgressBar {
    progress::build_spinner("{spinner:.cyan} {msg}")
}

fn observed_progress(progress: &InstallProgress) -> Option<(u64, u64)> {
    let observed = progress.observed_downloaded.or(progress.size)?;
    let total = progress.total_bytes?;
    Some((observed.min(total), total))
}

fn set_bar_style(bar: &ProgressBar) {
    bar.set_style(progress::progress_style(
        "{spinner:.cyan} {msg} [{bar:30.cyan/blue}] {percent:>3}%",
    ));
}

fn render_progress(bar: &ProgressBar, progress: &InstallProgress) {
    if let Some((downloaded, total)) = progress.downloaded_bytes.zip(progress.total_bytes) {
        if let Some((observed, observed_total)) = observed_progress(progress) {
            if observed > downloaded {
                set_bar_style(bar);
                bar.set_length(observed_total);
                bar.set_position(observed);
                bar.set_message(format!(
                    "{} / {}",
                    format_size(observed as i64),
                    format_size(observed_total as i64)
                ));
                return;
            }
        }

        set_bar_style(bar);
        bar.set_length(total);
        bar.set_position(downloaded);
        bar.set_message(format!(
            "{} / {}",
            format_size(downloaded as i64),
            format_size(total as i64)
        ));
        return;
    }

    bar.set_message(if progress.is_active {
        progress
            .observed_downloaded
            .or(progress.size)
            .map(|size| {
                format!(
                    "Install is actively downloading... observed {} on disk",
                    format_size(size as i64)
                )
            })
            .unwrap_or_else(|| "Install is actively preparing...".to_string())
    } else {
        progress
            .size
            .map(|size| format!("Downloaded {}", format_size(size as i64)))
            .unwrap_or_else(|| "Waiting for install metadata...".to_string())
    });
}

async fn follow_install_progress(config: &Config, entry: &GameLibraryEntry) -> Result<()> {
    let bar = build_progress_bar();
    let mut seen_status = false;
    let mut stalled_polls = 0usize;
    let mut empty_polls = 0usize;
    let mut last_progress = None;

    loop {
        match storefront_service::install_progress(config, entry)
            .await
            .map_err(anyhow::Error::from)?
        {
            Some(progress) => {
                seen_status = true;
                empty_polls = 0;
                render_progress(&bar, &progress);

                if progress.is_installed {
                    bar.finish_and_clear();
                    println!("{} Download complete.", "✔".green().bold());
                    return Ok(());
                }

                let current_progress = progress.downloaded_bytes.zip(progress.total_bytes);

                if current_progress.is_some() && current_progress != last_progress {
                    last_progress = current_progress;
                    stalled_polls = 0;
                } else if progress.is_active {
                    stalled_polls = 0;
                } else {
                    stalled_polls += 1;
                }
            }
            None => {
                if !seen_status {
                    empty_polls += 1;
                    if empty_polls >= FOLLOW_WAIT_POLLS {
                        bar.finish_and_clear();
                        println!(
                            "{} Install requested. The storefront has not reported download progress yet after waiting for install confirmation.",
                            "!".yellow().bold()
                        );
                        return Ok(());
                    }
                } else {
                    stalled_polls += 1;
                }
            }
        }

        if seen_status && stalled_polls >= FOLLOW_STALLED_POLLS {
            bar.finish_and_clear();
            println!(
                "{} Install requested. The storefront is not reporting active download progress.",
                "!".yellow().bold()
            );
            return Ok(());
        }

        sleep(FOLLOW_POLL_INTERVAL).await;
    }
}

fn ensure_follow_supported(config: &Config, entry: &GameLibraryEntry) -> Result<()> {
    match storefront_service::supports_install_tracking(config, entry) {
        Ok(true) => Ok(()),
        Ok(false) => {
            bail!(
                "--follow is not supported for {} installs yet",
                storefront_label(entry.storefront_id)
            )
        }
        Err(error) => Err(error.into()),
    }
}

pub async fn handle(
    pool: &DbPool,
    game_id: Option<String>,
    _storefront: Option<String>,
    follow: bool,
    config: &Config,
) -> Result<()> {
    clear_screen()?;

    let game_id = select_game_id(pool, game_id).await?;

    let target = resolve_install_target(pool, &game_id).await?;

    let entry = repository::find_game_library_entry(pool, &target.entry_id)
        .await
        .with_context(|| format!("failed to load library entry '{}'", target.entry_id))?;

    if follow {
        ensure_follow_supported(config, &entry)?;
    }

    println!(
        "{} Requesting install for {} via {}...",
        "▶".cyan().bold(),
        target.game_name.bold(),
        storefront_label(target.storefront_id)
    );

    storefront_service::install_library_entry(config, &entry)
        .await
        .with_context(|| format!("failed to start install for '{}'", target.game_name))?;

    if follow {
        println!("{} Following install progress...", "…".cyan().bold());
        follow_install_progress(config, &entry).await?;
    } else {
        println!("{} Download started.", "✔".green().bold());
    }

    Ok(())
}
