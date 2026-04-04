/// Fields to update on a game. `None` means "leave unchanged".
/// To set `igdb_id` to NULL, use `Some(None)`.
#[derive(Debug, Default)]
pub struct UpdateGame {
    pub name: Option<String>,
    pub game_status_id: Option<i64>,
    pub is_favorite: Option<bool>,
    pub igdb_id: Option<Option<i64>>,
}

#[derive(Debug, Default)]
pub struct UpdateGameLibraryEntry {
    pub is_installed: Option<bool>,
    pub location: Option<String>,
    pub size: Option<i64>,
    pub time_played: Option<i64>,
    pub last_played_at: Option<i64>,
}

#[derive(Debug, Default)]
pub struct NewGameLibraryEntry {
    pub id: String,
    pub game_id: String,
    pub storefront_id: i64,
    pub external_id: String,
    pub is_installed: bool,
    pub location: Option<String>,
    pub size: Option<i64>,
    pub time_played: i64,
    pub last_played_at: Option<i64>,
}

#[derive(Debug)]
pub struct NewGameLaunch {
    pub id: String,
    pub game_library_entry_id: String,
    pub name: String,
    pub executable: Option<String>,
    pub args: Option<String>,
    pub working_dir: Option<String>,
    pub is_default: bool,
    pub env: Option<String>,
    pub proton_dir: Option<String>,
}
