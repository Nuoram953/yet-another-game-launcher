use anyhow::Result;
use yagl_core::{config::Config, db::DbPool};

use crate::cli::Commands;

pub mod launch;
pub mod search;
pub mod sync;
pub mod view;

pub async fn run(command: Commands, pool: &DbPool, config: &Config) -> Result<()> {
    match command {
        Commands::Launch {
            game_id,
            launch_last,
            launch_id,
        } => launch::handle(pool, game_id, launch_id, launch_last).await,
        Commands::Sync { storefront } => sync::handle(pool, storefront, config).await,
        Commands::Search { name, launches } => search::handle(pool, name, launches, config).await,
        Commands::View { game_id } => view::handle(pool, game_id, config).await,
    }
}
