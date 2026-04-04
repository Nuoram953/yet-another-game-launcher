use anyhow::Result;
use colored::Colorize;
use yagl_core::domains::game::{models::SearchGamePayload, repository, service};
use yagl_core::{config::Config, db::DbPool};

pub async fn handle(pool: &DbPool, name: Option<String>, launches: bool, _: &Config) -> Result<()> {
    let payload = SearchGamePayload { name };
    let games = service::search_game(pool, payload).await?;

    if games.is_empty() {
        println!("{}", "No games found.".yellow());
    } else {
        for game in &games {
            println!(
                "{} {}",
                format!("[{}]", game.id).dimmed(),
                game.name.bold().cyan()
            );

            if launches {
                let game_launches = repository::find_launches_for_game(pool, &game.id).await?;
                if game_launches.is_empty() {
                    println!("  {}", "(no launch options)".dimmed());
                } else {
                    for launch in &game_launches {
                        let default_marker = if launch.is_default {
                            format!(" {}", "*".green().bold())
                        } else {
                            String::new()
                        };
                        println!(
                            "  {} {}{}",
                            format!("[{}]", launch.id).dimmed(),
                            launch.name,
                            default_marker
                        );
                    }

                    println!();
                }
            }
        }
    }

    Ok(())
}
