use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct GameAchievementData {
    pub source_statuses: Vec<AchievementSourceStatus>,
    pub sets: Vec<AchievementSet>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct AchievementSourceStatus {
    pub id: String,
    pub game_id: String,
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_game_id: String,
    pub has_achievements: bool,
    pub checked_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct AchievementSet {
    pub id: String,
    pub game_id: String,
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_set_id: String,
    pub external_game_id: String,
    pub variant: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Option<String>,
    pub unlocked_achievements: i64,
    pub total_achievements: i64,
    pub achievements: Vec<Achievement>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Achievement {
    pub id: String,
    pub achievement_set_id: String,
    pub external_id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
    pub icon_gray_url: Option<String>,
    pub is_hidden: bool,
    pub display_order: i64,
    pub is_unlocked: bool,
    pub unlocked_at: Option<i64>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct AchievementSetRecord {
    pub id: String,
    pub game_id: String,
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_set_id: String,
    pub external_game_id: String,
    pub variant: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct AchievementSourceStatusRecord {
    pub id: String,
    pub game_id: String,
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_game_id: String,
    pub has_achievements: bool,
    pub checked_at: i64,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct AchievementUpsertRecord {
    pub id: String,
    pub achievement_set_id: String,
    pub external_id: String,
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct AchievementRecord {
    pub id: String,
    pub achievement_set_id: String,
    pub external_id: String,
    pub name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
    pub icon_gray_url: Option<String>,
    pub is_hidden: bool,
    pub display_order: i64,
    pub is_unlocked: bool,
    pub unlocked_at: Option<i64>,
}
