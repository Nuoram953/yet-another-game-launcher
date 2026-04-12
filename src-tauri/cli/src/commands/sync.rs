use anyhow::{bail, Result};
use colored::Colorize;
use indicatif::{MultiProgress, ProgressBar};
use yagl_core::{
    config::Config,
    db::DbPool,
    domains::storefront::{
        models::Storefront,
        providers::StorefrontProvider,
        service::{sync_with_providers_observed, StorefrontSyncProgress, SyncProgressEvent},
        steam::provider::SteamProvider,
    },
    utils::storefront_label,
};

use crate::progress;

pub async fn handle(pool: &DbPool, storefront: Option<String>, config: &Config) -> Result<()> {
    let providers = resolve_providers(storefront)?;
    let mut renderer = SyncProgressRenderer::new();

    let result = sync_with_providers_observed(pool, providers, config, |event| {
        renderer.render(event);
    })
    .await
    .map_err(|e| anyhow::anyhow!("{e}"))?;

    println!(
        "{} Total — {} added, {} updated.",
        "✔".green().bold(),
        result.games_added.to_string().green().bold(),
        result.games_updated.to_string().cyan().bold(),
    );

    Ok(())
}

fn resolve_providers(
    storefront: Option<String>,
) -> Result<Vec<(Storefront, Box<dyn StorefrontProvider>)>> {
    match storefront.as_deref() {
        Some(name) if name.eq_ignore_ascii_case("steam") => Ok(vec![steam_provider()?]),
        Some(other) => bail!("unknown storefront '{other}' (supported: steam)"),
        None => Ok(vec![steam_provider()?]),
    }
}

fn steam_provider() -> Result<(Storefront, Box<dyn StorefrontProvider>)> {
    let steam_id = std::env::var("STEAM_USER_ID")
        .map_err(|_| anyhow::anyhow!("STEAM_USER_ID env var not set"))?;
    Ok((Storefront::Steam, Box::new(SteamProvider::new(steam_id))))
}

struct SyncProgressRenderer {
    progress: MultiProgress,
    rows: Vec<(Storefront, ProgressBar)>,
}

impl SyncProgressRenderer {
    fn new() -> Self {
        let progress = MultiProgress::new();
        progress.set_move_cursor(true);
        Self {
            progress,
            rows: Vec::new(),
        }
    }

    fn render(&mut self, event: SyncProgressEvent) {
        match event {
            SyncProgressEvent::StorefrontStarted { storefront } => {
                let bar = self.bar_for(storefront);
                bar.set_message("Fetching library...");
            }
            SyncProgressEvent::StorefrontSkipped { storefront } => {
                let bar = self.bar_for(storefront);
                bar.finish_with_message("Disabled in config".dimmed().to_string());
            }
            SyncProgressEvent::StorefrontFetched { progress } => {
                let bar = self.bar_for(progress.storefront);
                if progress.total_games == 0 {
                    bar.finish_with_message(storefront_summary(progress));
                } else {
                    bar.set_style(progress::progress_style(
                        "{spinner:.cyan} {prefix:<10} [{bar:30.cyan/blue}] {pos:>3}/{len:3} {msg}",
                    ));
                    bar.set_length(progress.total_games as u64);
                    bar.set_position(0);
                    bar.set_message(storefront_counts(progress));
                }
            }
            SyncProgressEvent::GameProcessed { progress, .. } => {
                let bar = self.bar_for(progress.storefront);
                if progress.total_games > 0 {
                    bar.set_position(progress.processed_games as u64);
                    bar.set_message(storefront_counts(progress));
                }
            }
            SyncProgressEvent::StorefrontCompleted { progress } => {
                let bar = self.bar_for(progress.storefront);
                bar.finish_with_message(storefront_summary(progress));
            }
        }
    }

    fn bar_for(&mut self, storefront: Storefront) -> ProgressBar {
        if let Some((_, bar)) = self
            .rows
            .iter()
            .find(|(row_storefront, _)| *row_storefront == storefront)
        {
            return bar.clone();
        }

        let bar = self.progress.add(progress::build_spinner(
            "{spinner:.cyan} {prefix:<10} {msg}",
        ));
        bar.set_prefix(storefront_label(storefront as i64).to_string());
        self.rows.push((storefront, bar.clone()));
        bar
    }
}

fn storefront_counts(progress: StorefrontSyncProgress) -> String {
    format!(
        "{} added, {} updated",
        progress.games_added.to_string().green().bold(),
        progress.games_updated.to_string().cyan().bold(),
    )
}

fn storefront_summary(progress: StorefrontSyncProgress) -> String {
    if progress.total_games == 0 {
        return format!("{} {}", "✔".green().bold(), "No games found".dimmed());
    }

    format!("{} {}", "✔".green().bold(), storefront_counts(progress))
}
