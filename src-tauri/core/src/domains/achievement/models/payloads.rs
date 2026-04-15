use serde::Deserialize;
use specta::Type;

#[derive(Debug, Deserialize, Type)]
pub struct GetGameAchievementSetsPayload {
    pub game_id: String,
    pub game_launch_id: Option<String>,
}
