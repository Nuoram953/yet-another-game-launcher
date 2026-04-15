PRAGMA foreign_keys = OFF;

CREATE TABLE achievement_set_new (
    id               TEXT    PRIMARY KEY NOT NULL,
    game_id          TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    game_launch_id   TEXT    REFERENCES game_launch(id) ON DELETE CASCADE,
    storefront_id    INTEGER REFERENCES storefront(id),
    provider         TEXT    NOT NULL,
    external_set_id  TEXT    NOT NULL DEFAULT '',
    external_game_id TEXT    NOT NULL DEFAULT '',
    variant          TEXT    NOT NULL DEFAULT '',
    name             TEXT    NOT NULL,
    description      TEXT,
    version          TEXT,
    created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at       INTEGER
);

INSERT INTO achievement_set_new (
    id,
    game_id,
    game_launch_id,
    storefront_id,
    provider,
    external_set_id,
    external_game_id,
    variant,
    name,
    description,
    version,
    created_at,
    updated_at
)
SELECT
    id,
    game_id,
    NULL,
    storefront_id,
    provider,
    external_set_id,
    external_game_id,
    variant,
    name,
    description,
    version,
    created_at,
    updated_at
FROM achievement_set;

DROP TABLE achievement_set;
ALTER TABLE achievement_set_new RENAME TO achievement_set;

CREATE INDEX IF NOT EXISTS idx_achievement_set_game_id
    ON achievement_set(game_id);

CREATE INDEX IF NOT EXISTS idx_achievement_set_game_launch_id
    ON achievement_set(game_launch_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievement_set_scope_unique
    ON achievement_set(game_id, COALESCE(game_launch_id, ''), provider, external_set_id, variant);

PRAGMA foreign_keys = ON;
