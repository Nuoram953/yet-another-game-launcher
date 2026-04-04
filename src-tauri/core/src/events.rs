use crate::domains::game::models::Game;
use tauri::{AppHandle, Emitter};

pub const GAME_UPDATED: &str = "game:updated";
pub const GAMES_REFRESH: &str = "games:refresh";
pub const GAME_RUNNING: &str = "game:running";
pub const GAME_ADDED: &str = "game:added";

pub fn emit_game_updated(app: &AppHandle, game: &Game) {
    app.emit(GAME_UPDATED, game).ok();
}

pub fn emit_game_added(app: &AppHandle, game: &Game) {
    app.emit(GAME_ADDED, game).ok();
}
