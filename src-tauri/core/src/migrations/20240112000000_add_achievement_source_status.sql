CREATE TABLE IF NOT EXISTS achievement_source_status (
    id               TEXT    PRIMARY KEY NOT NULL,
    game_id          TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    game_launch_id   TEXT    REFERENCES game_launch(id) ON DELETE CASCADE,
    storefront_id    INTEGER REFERENCES storefront(id),
    provider         TEXT    NOT NULL,
    external_game_id TEXT    NOT NULL DEFAULT '',
    has_achievements BOOLEAN NOT NULL,
    checked_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_achievement_source_status_game_id
    ON achievement_source_status(game_id);

CREATE INDEX IF NOT EXISTS idx_achievement_source_status_game_launch_id
    ON achievement_source_status(game_launch_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievement_source_status_scope_unique
    ON achievement_source_status(game_id, COALESCE(game_launch_id, ''), provider, external_game_id);
