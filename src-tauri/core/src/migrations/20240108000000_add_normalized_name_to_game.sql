ALTER TABLE game ADD COLUMN normalized_name TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_normalized_name ON game(normalized_name) WHERE normalized_name IS NOT NULL;
