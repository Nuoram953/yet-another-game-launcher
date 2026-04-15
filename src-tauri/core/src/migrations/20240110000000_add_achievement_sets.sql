CREATE TABLE IF NOT EXISTS achievement_set (
    id               TEXT    PRIMARY KEY NOT NULL,
    game_id          TEXT    NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    storefront_id    INTEGER REFERENCES storefront(id),
    provider         TEXT    NOT NULL,
    external_set_id  TEXT    NOT NULL DEFAULT '',
    external_game_id TEXT    NOT NULL DEFAULT '',
    variant          TEXT    NOT NULL DEFAULT '',
    name             TEXT    NOT NULL,
    description      TEXT,
    version          TEXT,
    created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at       INTEGER,
    UNIQUE(game_id, provider, external_set_id, variant)
);

CREATE INDEX IF NOT EXISTS idx_achievement_set_game_id
    ON achievement_set(game_id);

CREATE TABLE IF NOT EXISTS achievement (
    id                 TEXT    PRIMARY KEY NOT NULL,
    achievement_set_id TEXT    NOT NULL REFERENCES achievement_set(id) ON DELETE CASCADE,
    external_id        TEXT    NOT NULL,
    name               TEXT    NOT NULL,
    description        TEXT,
    icon_url           TEXT,
    icon_gray_url      TEXT,
    is_hidden          BOOLEAN NOT NULL DEFAULT 0,
    display_order      INTEGER NOT NULL DEFAULT 0,
    is_unlocked        BOOLEAN NOT NULL DEFAULT 0,
    unlocked_at        INTEGER,
    created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at         INTEGER,
    UNIQUE(achievement_set_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_achievement_achievement_set_id
    ON achievement(achievement_set_id);

INSERT INTO achievement_set (
    id,
    game_id,
    storefront_id,
    provider,
    external_set_id,
    external_game_id,
    variant,
    name
)
SELECT DISTINCT
    'legacy-achievement-set:' || gle.id,
    gle.game_id,
    gle.storefront_id,
    CASE
        WHEN gle.storefront_id = 1 THEN 'steam'
        WHEN gle.storefront_id = 0 THEN 'custom'
        ELSE 'storefront-' || gle.storefront_id
    END,
    gle.external_id,
    gle.external_id,
    '',
    g.name
FROM game_achievement ga
JOIN game_library_entry gle ON gle.id = ga.game_library_entry_id
JOIN game g ON g.id = gle.game_id;

INSERT INTO achievement (
    id,
    achievement_set_id,
    external_id,
    name,
    description,
    is_hidden,
    display_order,
    is_unlocked,
    unlocked_at
)
SELECT
    'legacy-achievement:' || ga.id,
    'legacy-achievement-set:' || ga.game_library_entry_id,
    ga.external_id,
    ga.name,
    ga.description,
    ga.is_hidden,
    0,
    ga.is_unlocked,
    ga.unlocked_at
FROM game_achievement ga;

DROP TABLE game_achievement;
