use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[repr(i64)]
pub enum GameStatus {
    Wishlist = 1,
    Playing = 2,
    Completed = 3,
    Dropped = 4,
    OnHold = 5,
    ToDo = 6,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Type)]
pub struct Game {
    pub id: String,
    pub name: String,
    pub game_status_id: i64,
    pub is_favorite: bool,
    pub igdb_id: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct GameActivity {
    pub id: i64,
    pub game_launch_id: Option<String>,
    pub started_at: i64,
    pub ended_at: i64,
    pub duration: i64,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct GameLaunch {
    pub id: String,
    pub game_library_entry_id: String,
    pub name: String,
    pub executable: Option<String>,
    pub args: Option<String>,
    pub working_dir: Option<String>,
    pub is_default: bool,
    pub created_at: i64,
    /// Newline-separated `KEY=VALUE` pairs injected into the process environment.
    pub env: Option<String>,
    /// Path to a Proton installation directory. When set the exe is launched via
    /// `{proton_dir}/proton run {executable}` with the Proton compat env vars
    /// derived automatically from the Steam library entry.
    pub proton_dir: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct GameLibraryEntry {
    pub id: String,
    pub game_id: String,
    pub storefront_id: i64,
    pub external_id: String,
    pub is_installed: bool,
    pub location: Option<String>,
    pub size: Option<i64>,
    pub time_played: i64,
    pub last_played_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}
