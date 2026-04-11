use async_trait::async_trait;

use crate::{
    config::Config,
    domains::storefront::models::{InstallProgress, StorefrontGame},
    error::AppError,
};

#[async_trait]
pub trait StorefrontProvider: Send + Sync {
    fn is_enabled(&self, config: &Config) -> bool;
    fn supports_install_tracking(&self) -> bool {
        false
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError>;
    async fn launch_game(&self, external_id: &str) -> Result<(), AppError>;
    async fn track_session(&self, external_id: &str) -> Option<(i64, i64)>;
    async fn install_game(&self, external_id: &str) -> Result<(), AppError>;
    async fn install_progress(
        &self,
        _external_id: &str,
    ) -> Result<Option<InstallProgress>, AppError> {
        Err(AppError::Internal(
            "install progress is not supported for this storefront".into(),
        ))
    }
    async fn uninstall_game(&self, external_id: &str) -> Result<(), AppError>;
}
