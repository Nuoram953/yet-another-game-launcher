#[derive(Debug, Clone)]
pub struct NewAchievementSource {
    pub id: String,
    pub game_id: String,
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_game_id: String,
    pub has_achievements: bool,
}

#[derive(Debug, Clone)]
pub struct NewAchievementSet {
    pub id: String,
    pub achievement_source_id: String,
    pub external_set_id: String,
    pub variant: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Clone)]
pub struct NewAchievement {
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

#[derive(Debug, Clone)]
pub struct ImportedAchievementSet {
    pub game_launch_id: Option<String>,
    pub storefront_id: Option<i64>,
    pub provider: String,
    pub external_set_id: String,
    pub external_game_id: String,
    pub variant: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Option<String>,
    pub achievements: Vec<ImportedAchievement>,
}

#[derive(Debug, Clone)]
pub struct ImportedAchievement {
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
