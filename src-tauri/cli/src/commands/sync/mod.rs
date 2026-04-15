mod progress;

use anyhow::{bail, Result};
use colored::Colorize;
use yagl_core::{
    config::Config,
    db::DbPool,
    domains::storefront::{
        models::Storefront,
        providers::StorefrontProvider,
        service::{sync_achievements_with_providers_observed, sync_with_providers_observed},
        steam::provider::SteamProvider,
    },
};

use self::progress::SyncProgressRenderer;

pub async fn handle(pool: &DbPool, storefront: Option<String>, config: &Config) -> Result<()> {
    let storefronts = resolve_storefronts(storefront.as_deref())?;
    let mut renderer = SyncProgressRenderer::new();

    for step in SyncStep::ALL {
        step.run(pool, &storefronts, config, &mut renderer).await?;
    }

    println!("\n");
    println!("{} Sync completed.", "✔".green().bold());

    Ok(())
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SyncStep {
    Libraries,
    Achievements,
}

impl SyncStep {
    const ALL: [Self; 2] = [Self::Libraries, Self::Achievements];

    async fn run(
        self,
        pool: &DbPool,
        storefronts: &[Storefront],
        config: &Config,
        renderer: &mut SyncProgressRenderer,
    ) -> Result<()> {
        match self {
            Self::Libraries => {
                sync_with_providers_observed(pool, build_providers(storefronts)?, config, |event| {
                    renderer.render(event);
                })
                .await
                .map(|_| ())
                .map_err(|error| anyhow::anyhow!("{error}"))
            }
            Self::Achievements => sync_achievements_with_providers_observed(
                pool,
                build_providers(storefronts)?,
                config,
                |event| {
                    renderer.render(event);
                },
            )
            .await
            .map_err(|error| anyhow::anyhow!("{error}")),
        }
    }
}

fn resolve_storefronts(storefront: Option<&str>) -> Result<Vec<Storefront>> {
    match storefront {
        Some(name) if name.eq_ignore_ascii_case("steam") => Ok(vec![Storefront::Steam]),
        Some(other) => bail!(
            "unknown storefront '{other}' (supported: {})",
            supported_storefront_names()
        ),
        None => Ok(all_storefronts()),
    }
}

fn build_providers(
    storefronts: &[Storefront],
) -> Result<Vec<(Storefront, Box<dyn StorefrontProvider>)>> {
    storefronts.iter().copied().map(provider_for).collect()
}

fn provider_for(storefront: Storefront) -> Result<(Storefront, Box<dyn StorefrontProvider>)> {
    match storefront {
        Storefront::Custom => bail!("custom storefront sync is not supported by the CLI yet"),
        Storefront::Steam => {
            let steam_id = std::env::var("STEAM_USER_ID")
                .map_err(|_| anyhow::anyhow!("STEAM_USER_ID env var not set"))?;
            Ok((Storefront::Steam, Box::new(SteamProvider::new(steam_id))))
        }
    }
}

fn all_storefronts() -> Vec<Storefront> {
    vec![Storefront::Steam]
}

fn supported_storefront_names() -> &'static str {
    "steam"
}
