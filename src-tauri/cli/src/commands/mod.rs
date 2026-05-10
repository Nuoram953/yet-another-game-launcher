use anyhow::Result;
use yagl_core::{config::Config, db::DbPool};

use crate::cli::Commands;

pub mod install;
pub mod launch;
pub mod search;
pub mod status;
pub mod sync;
pub mod uninstall;
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
        Commands::View {
            game_id,
            achievements,
        } => view::handle(pool, game_id, achievements, config).await,
        Commands::Install {
            game_id,
            storefront,
            follow,
        } => install::handle(pool, game_id, storefront, follow, config).await,
        Commands::Uninstall { game_id } => uninstall::handle(pool, game_id, config).await,
        Commands::Status { game_id, status } => status::handle(pool, game_id, status).await,
    }
}
