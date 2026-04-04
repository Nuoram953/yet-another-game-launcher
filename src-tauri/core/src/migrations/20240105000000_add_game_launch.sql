-- ---------------------------------------------------------------------------
-- Custom storefront (for user-added games with no store)
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO storefront (id, name, url, has_launcher) VALUES (0, 'Custom', NULL, 0);

-- ---------------------------------------------------------------------------
-- Launch configurations (N per library entry)
-- Each row describes one way to start a game: default storefront launcher,
-- a mod exe, alternate args, etc.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_launch (
    id                    TEXT    PRIMARY KEY NOT NULL,
    game_library_entry_id TEXT    NOT NULL REFERENCES game_library_entry(id) ON DELETE CASCADE,
    name                  TEXT    NOT NULL,
    executable            TEXT,               -- NULL = delegate to storefront launcher
    args                  TEXT,
    working_dir           TEXT,
    is_default            BOOLEAN NOT NULL DEFAULT 0,
    created_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_game_launch_entry_id
    ON game_launch(game_library_entry_id);

-- ---------------------------------------------------------------------------
-- Migrate game_activity to track per launch config instead of per entry.
-- SQLite does not support DROP COLUMN before 3.35, and renaming a referenced
-- column requires a table rebuild. We recreate the table and copy data,
-- setting game_launch_id to NULL for existing rows (legacy data has no
-- launch config yet).
-- ---------------------------------------------------------------------------
PRAGMA foreign_keys = OFF;

CREATE TABLE game_activity_new (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    game_launch_id TEXT    REFERENCES game_launch(id) ON DELETE SET NULL,
    started_at     INTEGER NOT NULL,
    ended_at       INTEGER NOT NULL,
    duration       INTEGER NOT NULL
);

INSERT INTO game_activity_new (id, game_launch_id, started_at, ended_at, duration)
    SELECT id, NULL, started_at, ended_at, duration FROM game_activity;

DROP TABLE game_activity;
ALTER TABLE game_activity_new RENAME TO game_activity;

CREATE INDEX IF NOT EXISTS idx_game_activity_launch_id
    ON game_activity(game_launch_id);

PRAGMA foreign_keys = ON;
