use serde::Deserialize;
use specta::Type;

#[derive(Debug, Deserialize, Type)]
pub struct GetByIdPayload {
    pub game_id: String,
}

#[derive(Debug, Deserialize, Type)]
pub struct UpdateStatusPayload {
    pub game_id: String,
    pub status_id: i64,
}

#[derive(Debug, Deserialize, Type)]
pub struct LaunchGamePayload {
    pub game_launch_id: String,
}

#[derive(Debug, Deserialize, Type)]
pub struct SearchGamePayload {
    pub name: Option<String>,
    pub has_any_installed: Option<bool>,
}

#[derive(Debug, Default)]
pub struct GameFilter {
    pub name: Option<String>,
    pub has_any_installed: Option<bool>,
}
