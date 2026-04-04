-- Seed missing game_status entry (matches the Rust GameStatus enum)
INSERT OR IGNORE INTO game_status (id, name) VALUES (6, 'ToDo');

-- Add has_launcher flag to storefront
ALTER TABLE storefront ADD COLUMN has_launcher BOOLEAN NOT NULL DEFAULT 0;

-- Flag whether the game concept itself supports achievements (set from IGDB/Steam metadata)
ALTER TABLE game ADD COLUMN has_achievements BOOLEAN NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- Companies (developers and publishers share the same table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company (
    id          TEXT    PRIMARY KEY NOT NULL,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT,
    country     INTEGER,
    url         TEXT,
    started_at  INTEGER
);

CREATE TABLE IF NOT EXISTS game_developer (
    id         TEXT PRIMARY KEY NOT NULL,
    game_id    TEXT NOT NULL REFERENCES game(id)    ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    UNIQUE(game_id, company_id)
);

CREATE TABLE IF NOT EXISTS game_publisher (
    id         TEXT PRIMARY KEY NOT NULL,
    game_id    TEXT NOT NULL REFERENCES game(id)    ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    UNIQUE(game_id, company_id)
);

-- ---------------------------------------------------------------------------
-- Engines
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engine (
    id   TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS game_engine (
    id        TEXT PRIMARY KEY NOT NULL,
    game_id   TEXT NOT NULL REFERENCES game(id)   ON DELETE CASCADE,
    engine_id TEXT NOT NULL REFERENCES engine(id) ON DELETE CASCADE,
    UNIQUE(game_id, engine_id)
);

-- ---------------------------------------------------------------------------
-- Tags  (genres, themes, game modes, player perspectives)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tag (
    id   TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS game_tag (
    id                    TEXT    PRIMARY KEY NOT NULL,
    game_id               TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    tag_id                TEXT    NOT NULL REFERENCES tag(id)  ON DELETE CASCADE,
    is_genre              BOOLEAN NOT NULL DEFAULT 0,
    is_theme              BOOLEAN NOT NULL DEFAULT 0,
    is_game_mode          BOOLEAN NOT NULL DEFAULT 0,
    is_player_perspective BOOLEAN NOT NULL DEFAULT 0,
    UNIQUE(game_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- User review (one per game)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_review (
    id                TEXT    PRIMARY KEY NOT NULL,
    game_id           TEXT    NOT NULL UNIQUE REFERENCES game(id) ON DELETE CASCADE,
    is_advance_review BOOLEAN NOT NULL DEFAULT 0,
    score             INTEGER NOT NULL,
    score_graphic     INTEGER,
    score_gameplay    INTEGER,
    score_story       INTEGER,
    score_sound       INTEGER,
    score_content     INTEGER,
    review            TEXT
);

CREATE INDEX IF NOT EXISTS idx_game_review_game_id ON game_review(game_id);

-- ---------------------------------------------------------------------------
-- User-defined game rankings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ranking_status (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
);

INSERT OR IGNORE INTO ranking_status (id, name) VALUES
    (1, 'Active'),
    (2, 'Archived');

CREATE TABLE IF NOT EXISTS ranking (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT    NOT NULL,
    max_items         INTEGER NOT NULL DEFAULT 10,
    ranking_status_id INTEGER NOT NULL REFERENCES ranking_status(id),
    created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at        INTEGER
);

CREATE TABLE IF NOT EXISTS ranking_game (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    rank       INTEGER,
    ranking_id INTEGER NOT NULL REFERENCES ranking(id) ON DELETE CASCADE,
    game_id    TEXT    NOT NULL REFERENCES game(id)    ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER,
    UNIQUE(ranking_id, game_id)
);

-- ---------------------------------------------------------------------------
-- Media defaults  (poster, banner, hero, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_type (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS media_default (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id       TEXT    NOT NULL REFERENCES game(id)       ON DELETE CASCADE,
    media_type_id INTEGER NOT NULL REFERENCES media_type(id) ON DELETE CASCADE,
    media_name    TEXT    NOT NULL,
    created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(media_type_id, game_id)
);

-- ---------------------------------------------------------------------------
-- Download history  (per library entry — downloads are storefront-specific)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS download_history (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    game_library_entry_id TEXT    NOT NULL REFERENCES game_library_entry(id) ON DELETE CASCADE,
    created_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_download_history_entry_id
    ON download_history(game_library_entry_id);

-- ---------------------------------------------------------------------------
-- Saved filter presets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS filter_preset (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    config     TEXT    NOT NULL, -- JSON stored as TEXT
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER
);
