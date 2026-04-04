use serde::Deserialize;
use specta::Type;

#[derive(Debug, Deserialize, Type)]
pub struct GetMediaPayload {
    pub entity_type: String,
    pub entity_id: String,
}

#[derive(Debug, Deserialize, Type)]
pub struct GetMediaByTypePayload {
    pub entity_type: String,
    pub entity_id: String,
    pub media_type_id: i64,
}

#[derive(Debug, Deserialize, Type)]
pub struct DeleteMediaPayload {
    pub id: String,
}
