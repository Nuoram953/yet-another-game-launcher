use std::path::PathBuf;

use clap::{ArgAction, Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "yagl",
    version,
    about = "Yet Another Game Launcher CLI",
    long_about = "Yet Another Game Launcher CLI\n\nLaunch games and track play sessions from the terminal.\n\nDatabase path is resolved in this order:\n  1. --db flag\n  2. DATABASE_URL environment variable (sqlite:// prefix is stripped)\n  3. Platform default (~/.local/share/... on Linux, ~/Library/... on macOS, %APPDATA%\\... on Windows)"
)]
pub struct Cli {
    #[arg(long, global = true)]
    pub db: Option<PathBuf>,

    #[arg(short, long, action = ArgAction::Count, global = true)]
    pub verbose: u8,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    #[command(
        about = "Launch game",
        after_help = "Examples:\n  yagl launch                      (interactive)\n  yagl launch abc123\n  yagl launch abc123 --launch-id cfg456\n  yagl --db /tmp/test.db launch abc123"
    )]
    Launch {
        game_id: Option<String>,

        #[arg(short, long, action = ArgAction::SetTrue)]
        launch_last: bool,

        #[arg(long)]
        launch_id: Option<String>,
    },

    #[command(about = "Sync games from a storefront into the database")]
    Sync {
        #[arg(
            short,
            long,
            value_name = "STOREFRONT",
            help = "Storefront to sync (e.g. steam)"
        )]
        storefront: String,
    },

    #[command(about = "Search for games")]
    Search {
        #[arg(short, long, value_name = "NAME", help = "Game's name")]
        name: Option<String>,

        #[arg(short, long, action = ArgAction::SetTrue, help = "Show available launch options")]
        launches: bool,
    },

    #[command(about = "View details for a game")]
    View { game_id: Option<String> },

    #[command(
        about = "Install a game from a storefront",
        after_help = "Examples:\n  yagl install abc123\n  yagl install abc123 --follow\n  yagl --db /tmp/test.db install abc123 -f"
    )]
    Install {
        game_id: Option<String>,

        #[arg(
            short,
            long,
            value_name = "STOREFRONT",
            help = "Storefront to sync (e.g. steam)"
        )]
        storefront: Option<String>,

        #[arg(short = 'f', long, action = ArgAction::SetTrue, help = "Follow install progress when supported")]
        follow: bool,
    },
}
