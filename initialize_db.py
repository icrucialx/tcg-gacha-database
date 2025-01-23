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

conn.commit()
conn.close()

print("Database initialized.")
