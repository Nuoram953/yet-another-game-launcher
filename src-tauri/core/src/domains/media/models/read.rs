use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Type)]
pub struct MediaType {
    pub id: i64,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Type)]
pub struct Media {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub media_type_id: i64,
    pub file_name: String,
    pub source_url: Option<String>,
    pub is_user: bool,
    pub created_at: i64,
}
