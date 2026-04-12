#![doc = include_str!("../../../README.md")]

pub mod cli;
pub mod commands;
pub mod config;
pub mod interactive;
pub mod progress;
pub mod utils;

use anyhow::{Context, Result};
use clap::Parser;
use tracing_subscriber::{fmt, EnvFilter};

pub async fn run() -> Result<()> {
    dotenvy::dotenv().ok();

    let args = cli::Cli::parse();

    let level = match args.verbose {
        0 => "warn",
        1 => "info",
        _ => "debug",
    };
    fmt()
        .compact()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(level)),
        )
        .with_target(false)
        .with_writer(std::io::stderr)
        .init();

    let config = config::load_config();
    let db_path = config::resolve_db_path(args.db);

    let pool = yagl_core::db::connect(&db_path)
        .await
        .with_context(|| format!("failed to open database at {db_path}"))?;

    commands::run(args.command, &pool, &config).await
}
