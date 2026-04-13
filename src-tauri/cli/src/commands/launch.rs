use anyhow::{Context, Result};
use colored::Colorize;
use yagl_core::db::DbPool;
use yagl_core::domains::game::{models::LaunchGamePayload, repository, service};

use crate::utils;

struct LaunchTarget {
    launch_id: String,
    game_name: String,
    launch_name: String,
}

async fn resolve_by_launch_id(pool: &DbPool, id: String) -> Result<LaunchTarget> {
    let launch = repository::find_game_launch(pool, &id)
        .await
        .with_context(|| format!("launch config '{id}' not found"))?;
    let entry = repository::find_game_library_entry(pool, &launch.game_library_entry_id)
        .await
        .context("failed to load library entry")?;
    let game = repository::find_by_id(pool, &entry.game_id)
        .await
        .context("failed to load game")?;
    Ok(LaunchTarget {
        launch_id: id,
        game_name: game.name,
        launch_name: launch.name,
    })
}

async fn resolve_by_game_id(pool: &DbPool, gid: &str) -> Result<LaunchTarget> {
    let launch = repository::find_default_launch_for_game(pool, gid)
        .await
        .with_context(|| format!("no launch config found for game '{gid}'"))?;
    let game = repository::find_by_id(pool, gid)
        .await
        .with_context(|| format!("game '{gid}' not found"))?;
    Ok(LaunchTarget {
        launch_id: launch.id,
        game_name: game.name,
        launch_name: launch.name,
    })
}

async fn resolve_last_launch(pool: &DbPool) -> Result<LaunchTarget> {
    let launch = repository::find_last_game_launch(pool)
        .await
        .context("no launch found")?;
    let game = repository::find_game_by_game_launch(pool, &launch.id)
        .await
        .context("game not found")?;
    Ok(LaunchTarget {
        launch_id: launch.id,
        game_name: game.name,
        launch_name: launch.name,
    })
}

async fn resolve_interactively(pool: &DbPool) -> Result<LaunchTarget> {
    let game_id = utils::select_game_id(pool, None).await?;
    let launch_id = utils::select_launch_id(pool, None, &game_id).await?;
    resolve_by_launch_id(pool, launch_id).await
}

pub async fn handle(
    pool: &DbPool,
    game_id: Option<String>,
    launch_id: Option<String>,
    launch_last: bool,
) -> Result<()> {
    let target = if let Some(id) = launch_id {
        resolve_by_launch_id(pool, id).await?
    } else if let Some(gid) = game_id.as_deref() {
        resolve_by_game_id(pool, gid).await?
    } else if launch_last {
        resolve_last_launch(pool).await?
    } else {
        resolve_interactively(pool).await?
    };

    crate::utils::clear_screen()?;
    println!(
        "{} {} with launch config '{}'...",
        "▶".cyan().bold(),
        target.game_name.bold(),
        target.launch_name
    );

    service::launch_and_track(
        pool,
        LaunchGamePayload {
            game_launch_id: target.launch_id,
        },
    )
    .await
    .with_context(|| format!("failed to launch '{}'", target.game_name))?;

    println!("{} Session recorded.", "✔".green().bold());

    Ok(())
}
