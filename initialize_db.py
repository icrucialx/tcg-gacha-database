import sqlite3

# Connect to SQLite database
conn = sqlite3.connect('tcg-gacha.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    attack INTEGER,
    defense INTEGER
)
''')

# Insert sample data
cards = [
    ('Dragon Flame', 'Rare', 50, 30),
    ('Water Shield', 'Common', 20, 40),
    ('Mystic Wind', 'Epic', 70, 20),
]
cursor.executemany('INSERT INTO cards (name, rarity, attack, defense) VALUES (?, ?, ?, ?)', cards)

conn.commit()
conn.close()
print("Database initialized.")
