use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[repr(i64)]
pub enum Storefront {
    Custom = 0,
    Steam = 1,
}

impl TryFrom<i64> for Storefront {
    type Error = ();

    fn try_from(value: i64) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(Storefront::Custom),
            1 => Ok(Storefront::Steam),
            _ => Err(()),
        }
    }
}

pub struct StorefrontGame {
    pub external_id: String,
    pub name: String,
    pub location: String,
    pub size: Option<u64>,
    pub igdb_id: Option<i64>,
    pub time_played: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
pub enum GameSyncStatus {
    Added,
    Updated,
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct GameSyncEntry {
    pub name: String,
    pub status: GameSyncStatus,
}

#[derive(Debug, Serialize, Deserialize, Type)]
pub struct SyncResult {
    pub games: Vec<GameSyncEntry>,
    pub games_added: u32,
    pub games_updated: u32,
}
