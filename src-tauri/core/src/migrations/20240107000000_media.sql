-- ---------------------------------------------------------------------------
-- Media types
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO media_type (id, name) VALUES
    (1, 'cover'),        -- portrait cover art
    (2, 'background'),   -- full-width hero / background image
    (3, 'banner'),       -- horizontal capsule / library banner
    (4, 'icon'),         -- small square icon
    (5, 'logo'),         -- transparent game logo overlay
    (6, 'screenshot'),   -- in-game screenshots (multiple per entity)
    (7, 'video');        -- trailers / gameplay clips (multiple per entity)

-- ---------------------------------------------------------------------------
-- Drop legacy media_default (game-only, raw filename, never populated)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS media_default;

-- ---------------------------------------------------------------------------
-- Generic media table
--
-- Path convention (reconstructed at runtime, never stored):
--   {data_dir}/media/{entity_type}/{entity_id}/{media_type_name}/{file_name}
--
-- Examples:
--   media/games/{game_id}/cover/igdb_abc123.jpg
--   media/companies/{company_id}/logo/logo.png
--   media/achievements/{achievement_id}/icon/unlocked.png
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
    id            TEXT    PRIMARY KEY NOT NULL,             -- UUID
    entity_type   TEXT    NOT NULL,                        -- 'game', 'company', 'achievement', …
    entity_id     TEXT    NOT NULL,
    media_type_id INTEGER NOT NULL REFERENCES media_type(id),
    file_name     TEXT    NOT NULL,                        -- filename only, e.g. "cover.jpg"
    source_url    TEXT,                                    -- original remote URL (nullable)
    is_user       BOOLEAN NOT NULL DEFAULT 0,              -- 1 = user-provided override
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_media_entity
    ON media(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_media_entity_type
    ON media(entity_type, entity_id, media_type_id);
