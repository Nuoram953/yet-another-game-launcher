use async_trait::async_trait;

use super::service;
use crate::{
    config::Config,
    domains::{
        achievement::models::ImportedAchievementSet,
        storefront::{
            models::{InstallProgress, StorefrontGame},
            providers::StorefrontProvider,
        },
    },
    error::AppError,
};

pub struct SteamProvider {
    pub steam_id: String,
}

impl SteamProvider {
    pub fn new(steam_id: impl Into<String>) -> Self {
        Self {
            steam_id: steam_id.into(),
        }
    }
}

#[async_trait]
impl StorefrontProvider for SteamProvider {
    fn is_enabled(&self, config: &Config) -> bool {
        config.storefront.steam.enable
    }

    fn supports_install_tracking(&self) -> bool {
        true
    }

    async fn sync_library(&self) -> Result<Vec<StorefrontGame>, AppError> {
        service::sync_library(&self.steam_id, service::default_base_url()).await
    }

    async fn launch_game(&self, external_id: &str) -> Result<(), AppError> {
        service::launch_game(external_id)
    }

    async fn track_session(&self, external_id: &str) -> Option<(i64, i64)> {
        service::track_game_session(external_id).await
    }

    async fn install_game(&self, external_id: &str) -> Result<(), AppError> {
        service::install_game(external_id)
    }

    async fn install_progress(
        &self,
        external_id: &str,
    ) -> Result<Option<InstallProgress>, AppError> {
        service::install_progress(external_id)
    }

    async fn uninstall_game(&self, external_id: &str) -> Result<(), AppError> {
        service::uninstall_game(external_id)
    }

    async fn fetch_achievement_set(
        &self,
        external_id: &str,
    ) -> Result<Option<ImportedAchievementSet>, AppError> {
        service::fetch_achievement_set(&self.steam_id, external_id, service::default_base_url())
            .await
    }
}
