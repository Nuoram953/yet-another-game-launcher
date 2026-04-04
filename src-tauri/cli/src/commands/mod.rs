use anyhow::Result;
use yagl_core::{config::Config, db::DbPool};

use crate::cli::Commands;

pub mod launch;
pub mod search;
pub mod sync;

pub async fn run(command: Commands, pool: &DbPool, config: &Config) -> Result<()> {
    match command {
        Commands::Launch { game_id, launch_id } => launch::handle(pool, game_id, launch_id).await,
        Commands::Sync { storefront } => sync::handle(pool, storefront, config).await,
        Commands::Search { name, launches } => search::handle(pool, name, launches, config).await,
    }
}
