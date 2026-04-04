CREATE TABLE IF NOT EXISTS game_status (
    id   INTEGER PRIMARY KEY,
    name TEXT    NOT NULL UNIQUE
);

INSERT OR IGNORE INTO game_status (id, name) VALUES
    (1, 'Wishlist'),
    (2, 'Playing'),
    (3, 'Completed'),
    (4, 'Dropped'),
    (5, 'OnHold');
