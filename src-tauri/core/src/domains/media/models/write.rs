pub struct NewMedia {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub media_type_id: i64,
    pub file_name: String,
    pub source_url: Option<String>,
    pub is_user: bool,
}
