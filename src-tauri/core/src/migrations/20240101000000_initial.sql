CREATE TABLE IF NOT EXISTS game (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    game_status_id INTEGER NOT NULL DEFAULT 1,
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS game_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    game_status_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
