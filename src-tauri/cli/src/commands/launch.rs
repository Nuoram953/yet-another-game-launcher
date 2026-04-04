use anyhow::{Context, Result};
use colored::Colorize;
use yagl_core::db::DbPool;
use yagl_core::domains::game::{
    models::{GameFilter, LaunchGamePayload},
    repository, service,
};

use crate::interactive;

pub async fn handle(
    pool: &DbPool,
    game_id: Option<String>,
    launch_id: Option<String>,
) -> Result<()> {
    let (launch_id, game_name, launch_name) = match launch_id {
        Some(id) => {
            let launch = repository::find_game_launch(pool, &id)
                .await
                .with_context(|| format!("launch config '{id}' not found"))?;
            let entry = repository::find_game_library_entry(pool, &launch.game_library_entry_id)
                .await
                .context("failed to load library entry")?;
            let game = repository::find_by_id(pool, &entry.game_id)
                .await
                .context("failed to load game")?;
            (id, game.name, launch.name)
        }
        None => match game_id.as_deref() {
            Some(gid) => {
                let launch = repository::find_default_launch_for_game(pool, gid)
                    .await
                    .with_context(|| format!("no launch config found for game '{gid}'"))?;
                let game = repository::find_by_id(pool, gid)
                    .await
                    .with_context(|| format!("game '{gid}' not found"))?;
                (launch.id, game.name, launch.name)
            }
            None => {
                let games = repository::search_games(pool, &GameFilter { name: None })
                    .await
                    .context("failed to load games")?;

                let game = interactive::fuzzy_select("Select a game", &games, |g| g.name.clone())?;

                let launches = repository::find_launches_for_game(pool, &game.id)
                    .await
                    .with_context(|| format!("failed to load launches for '{}'", game.name))?;

                if launches.is_empty() {
                    anyhow::bail!("no launch configs found for '{}'", game.name);
                }

                let (selected_id, selected_name) = if launches.len() == 1 {
                    let l = launches.into_iter().next().unwrap();
                    (l.id, l.name)
                } else {
                    let l = interactive::select("Select a launch config", &launches, |l| {
                        l.name.clone()
                    })?;
                    (l.id.clone(), l.name.clone())
                };

                (selected_id, game.name.clone(), selected_name)
            }
        },
    };

    println!(
        "{} {} with launch config '{}'...",
        "▶".cyan().bold(),
        game_name.bold(),
        launch_name
    );

    service::launch_and_track(
        pool,
        LaunchGamePayload {
            game_launch_id: launch_id.clone(),
        },
    )
    .await
    .with_context(|| format!("failed to launch '{game_name}'"))?;

    println!("{} Session recorded.", "✔".green().bold());

    Ok(())
}
