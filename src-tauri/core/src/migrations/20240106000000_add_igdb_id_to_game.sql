ALTER TABLE game ADD COLUMN igdb_id INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_igdb_id ON game(igdb_id) WHERE igdb_id IS NOT NULL;
