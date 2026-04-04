-- Storefront reference table (seeded at startup)
CREATE TABLE IF NOT EXISTS storefront (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE,
    url  TEXT
);

INSERT OR IGNORE INTO storefront (id, name) VALUES (1, 'Steam');

-- Extend game with concept-level metadata
ALTER TABLE game ADD COLUMN score_critic       INTEGER;
ALTER TABLE game ADD COLUMN score_community    INTEGER;
ALTER TABLE game ADD COLUMN score_user         INTEGER;
ALTER TABLE game ADD COLUMN summary            TEXT;
ALTER TABLE game ADD COLUMN released_at        INTEGER;
ALTER TABLE game ADD COLUMN main_story         INTEGER;
ALTER TABLE game ADD COLUMN main_plus_extra    INTEGER;
ALTER TABLE game ADD COLUMN completionist      INTEGER;
ALTER TABLE game ADD COLUMN created_at         INTEGER NOT NULL DEFAULT (unixepoch());

-- One row per (game × storefront) — storefront-specific data
CREATE TABLE IF NOT EXISTS game_library_entry (
    id              TEXT    PRIMARY KEY NOT NULL,
    game_id         TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    storefront_id   INTEGER NOT NULL REFERENCES storefront(id),
    external_id     TEXT    NOT NULL,
    is_installed    BOOLEAN NOT NULL DEFAULT 0,
    location        TEXT,
    size            INTEGER,
    time_played     INTEGER NOT NULL DEFAULT 0,
    last_played_at  INTEGER,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER,
    UNIQUE(storefront_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_game_library_entry_game_id
    ON game_library_entry(game_id);

-- Achievements belong to a library entry (storefront-specific)
CREATE TABLE IF NOT EXISTS game_achievement (
    id                    TEXT    PRIMARY KEY NOT NULL,
    game_library_entry_id TEXT    NOT NULL REFERENCES game_library_entry(id) ON DELETE CASCADE,
    external_id           TEXT    NOT NULL,
    name                  TEXT    NOT NULL,
    description           TEXT,
    rarity                INTEGER,
    is_hidden             BOOLEAN NOT NULL DEFAULT 0,
    is_unlocked           BOOLEAN NOT NULL DEFAULT 0,
    unlocked_at           INTEGER,
    UNIQUE(game_library_entry_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_game_achievement_entry_id
    ON game_achievement(game_library_entry_id);

-- Play sessions belong to a library entry (storefront-specific)
CREATE TABLE IF NOT EXISTS game_activity (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    game_library_entry_id TEXT    NOT NULL REFERENCES game_library_entry(id) ON DELETE CASCADE,
    started_at            INTEGER NOT NULL,
    ended_at              INTEGER NOT NULL,
    duration              INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_activity_entry_id
    ON game_activity(game_library_entry_id);
