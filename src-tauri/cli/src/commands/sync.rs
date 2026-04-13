use anyhow::{bail, Result};
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use std::time::Duration;
use yagl_core::{
    config::Config,
    db::DbPool,
    domains::storefront::{
        models::{GameSyncStatus, Storefront},
        providers::StorefrontProvider,
        service::sync_with_providers_tracked,
        steam::provider::SteamProvider,
    },
};

pub async fn handle(pool: &DbPool, storefront: String, config: &Config) -> Result<()> {
    let providers: Vec<(Storefront, Box<dyn StorefrontProvider>)> =
        match storefront.to_lowercase().as_str() {
            "steam" => {
                let steam_id = std::env::var("STEAM_USER_ID")
                    .map_err(|_| anyhow::anyhow!("STEAM_USER_ID env var not set"))?;
                vec![(Storefront::Steam, Box::new(SteamProvider::new(steam_id)))]
            }
            other => bail!("unknown storefront '{other}' (supported: steam)"),
        };

    let spinner = ProgressBar::new_spinner();
    spinner.set_style(
        ProgressStyle::default_spinner()
            .tick_strings(&["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"])
            .template("{spinner:.cyan} Syncing '{msg}'...")
            .unwrap(),
    );
    spinner.set_message(storefront.clone());
    spinner.enable_steady_tick(Duration::from_millis(80));

    let result = sync_with_providers_tracked(pool, providers, config, |entry| {
        let (icon, name_colored) = match entry.status {
            GameSyncStatus::Added => ("+".green().bold(), entry.name.green()),
            GameSyncStatus::Updated => ("~".cyan().bold(), entry.name.cyan()),
        };
        spinner.println(format!("  {} {}", icon, name_colored));
    })
    .await
    .map_err(|e| anyhow::anyhow!("{e}"))?;

    spinner.finish_and_clear();

    println!(
        "{} Done — {} added, {} updated.",
        "✔".green().bold(),
        result.games_added.to_string().green().bold(),
        result.games_updated.to_string().cyan().bold(),
    );

    Ok(())
}
