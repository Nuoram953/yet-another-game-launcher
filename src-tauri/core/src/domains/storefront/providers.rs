use async_trait::async_trait;

use crate::{config::Config, domains::storefront::models::StorefrontGame, error::AppError};

#[async_trait]
pub trait StorefrontProvider: Send + Sync {
    fn is_enabled(&self, config: &Config) -> bool;

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError>;
    async fn launch_game(&self, external_id: &str) -> Result<(), AppError>;
    async fn track_session(&self, external_id: &str) -> Option<(i64, i64)>;
}
