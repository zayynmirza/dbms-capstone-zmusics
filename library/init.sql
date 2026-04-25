CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    artist TEXT,
    album TEXT,
    duration TEXT,
    fileName TEXT,
    cover TEXT,
    isFavorite INTEGER DEFAULT 0
);

-- Initial Data
INSERT INTO songs (title, artist, album, duration, fileName, cover, isFavorite) VALUES 
('Nunchaku', 'Zayn, Kaatil, Prinsane, Howl', 'Single', '2:45', 'nunchaku.wav', 'nunchaku.jpg', 0),
('Red Dot', 'Zayn', 'Single', '3:12', 'red-dot.wav', 'red-dot.jpg', 0),
('Replica', 'Zayn', 'Single', '2:58', 'replica.wav', 'replica.jpg', 0),
('Roke Na Ruke', 'Zayn, Howl', 'Single', '3:30', 'roke-na-ruke.wav', 'roke-na-ruke.png', 0);
