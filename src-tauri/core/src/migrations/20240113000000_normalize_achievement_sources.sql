PRAGMA foreign_keys = OFF;

CREATE TABLE achievement_source (
    id               TEXT    PRIMARY KEY NOT NULL,
    game_id          TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    game_launch_id   TEXT    REFERENCES game_launch(id) ON DELETE CASCADE,
    storefront_id    INTEGER REFERENCES storefront(id),
    provider         TEXT    NOT NULL,
    external_game_id TEXT    NOT NULL DEFAULT '',
    has_achievements BOOLEAN NOT NULL,
    checked_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT INTO achievement_source (
    id,
    game_id,
    game_launch_id,
    storefront_id,
    provider,
    external_game_id,
    has_achievements,
    checked_at
)
WITH source_rows AS (
    SELECT
        game_id,
        game_launch_id,
        storefront_id,
        provider,
        external_game_id,
        has_achievements,
        checked_at
    FROM achievement_source_status
    UNION ALL
    SELECT
        game_id,
        game_launch_id,
        storefront_id,
        provider,
        external_game_id,
        1,
        COALESCE(updated_at, created_at, unixepoch())
    FROM achievement_set
)
SELECT
    'achievement-source:' || game_id || ':' || COALESCE(game_launch_id, '') || ':' || provider || ':' || external_game_id,
    game_id,
    game_launch_id,
    MAX(storefront_id),
    provider,
    external_game_id,
    MAX(has_achievements),
    MAX(checked_at)
FROM source_rows
GROUP BY game_id, COALESCE(game_launch_id, ''), provider, external_game_id;

CREATE TABLE achievement_set_new (
    id                    TEXT    PRIMARY KEY NOT NULL,
    achievement_source_id TEXT    NOT NULL REFERENCES achievement_source(id) ON DELETE CASCADE,
    external_set_id       TEXT    NOT NULL DEFAULT '',
    variant               TEXT    NOT NULL DEFAULT '',
    name                  TEXT    NOT NULL,
    description           TEXT,
    version               TEXT,
    created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at            INTEGER
);

INSERT INTO achievement_set_new (
    id,
    achievement_source_id,
    external_set_id,
    variant,
    name,
    description,
    version,
    created_at,
    updated_at
)
SELECT
    id,
    'achievement-source:' || game_id || ':' || COALESCE(game_launch_id, '') || ':' || provider || ':' || external_game_id,
    external_set_id,
    variant,
    name,
    description,
    version,
    created_at,
    updated_at
FROM achievement_set;

DROP TABLE achievement_set;
ALTER TABLE achievement_set_new RENAME TO achievement_set;

CREATE INDEX IF NOT EXISTS idx_achievement_source_game_id
    ON achievement_source(game_id);

CREATE INDEX IF NOT EXISTS idx_achievement_source_game_launch_id
    ON achievement_source(game_launch_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievement_source_scope_unique
    ON achievement_source(game_id, COALESCE(game_launch_id, ''), provider, external_game_id);

CREATE INDEX IF NOT EXISTS idx_achievement_set_achievement_source_id
    ON achievement_set(achievement_source_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievement_set_scope_unique
    ON achievement_set(achievement_source_id, external_set_id, variant);

DROP TABLE achievement_source_status;

PRAGMA foreign_keys = ON;
