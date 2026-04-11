use std::io::{self, IsTerminal, Write};

use anyhow::{Context, Result};
use colored::Colorize;
use yagl_core::db::DbPool;
use yagl_core::domains::game::{models::GameFilter, repository};

use crate::interactive;

pub async fn select_game_id(pool: &DbPool, game_id: Option<String>) -> Result<String> {
    match game_id {
        Some(gid) => {
            repository::find_by_id(pool, &gid)
                .await
                .with_context(|| format!("game '{gid}' not found"))?;
            Ok(gid)
        }
        None => {
            let games = repository::search_games(
                pool,
                &GameFilter {
                    name: None,
                    has_any_installed: None,
                },
            )
            .await
            .context("failed to load games")?;

            let game = interactive::fuzzy_select("Select a game", &games, |g| g.name.clone())?;

            Ok(game.id.clone())
        }
    }
}

pub async fn select_installed_game_id(pool: &DbPool, game_id: Option<String>) -> Result<String> {
    match game_id {
        Some(gid) => {
            repository::find_by_id(pool, &gid)
                .await
                .with_context(|| format!("game '{gid}' not found"))?;
            Ok(gid)
        }
        None => {
            let games = repository::search_games(
                pool,
                &GameFilter {
                    name: None,
                    has_any_installed: Some(true),
                },
            )
            .await
            .context("failed to load installed games")?;

            let game = interactive::fuzzy_select("Select a game", &games, |g| g.name.clone())?;

            Ok(game.id.clone())
        }
    }
}

pub async fn select_launch_id(
    pool: &DbPool,
    launch_id: Option<String>,
    game_id: &str,
) -> Result<String> {
    match launch_id {
        Some(lid) => {
            repository::find_game_launch(pool, &lid)
                .await
                .with_context(|| format!("launch config '{lid}' not found"))?;
            Ok(lid)
        }
        None => {
            let launches = repository::find_launches_for_game(pool, game_id)
                .await
                .with_context(|| format!("failed to load launches for game '{game_id}'"))?;

            if launches.is_empty() {
                anyhow::bail!("no launch configs found for game '{game_id}'");
            }

            if launches.len() == 1 {
                return Ok(launches.into_iter().next().unwrap().id);
            }

            let l = interactive::select("Select a launch config", &launches, |l| l.name.clone())?;
            Ok(l.id.clone())
        }
    }
}

pub fn print_separator() {
    println!("{}", "─".repeat(40).dimmed());
}

pub fn clear_screen() -> Result<()> {
    const CLEAR_SEQUENCE: &[u8] = b"\x1b[2J\x1b[H";

    if io::stderr().is_terminal() {
        let mut stderr = io::stderr().lock();
        stderr.write_all(CLEAR_SEQUENCE)?;
        stderr.flush()?;
    } else if io::stdout().is_terminal() {
        let mut stdout = io::stdout().lock();
        stdout.write_all(CLEAR_SEQUENCE)?;
        stdout.flush()?;
    }

    Ok(())
}
