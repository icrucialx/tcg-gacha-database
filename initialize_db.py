import sqlite3

# Connect to SQLite database
conn = sqlite3.connect('tcg-gacha.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
INSERT INTO cards (card_name, rarity, date_of_pull)
VALUES
    ('Pikachu', 'common', '2025-01-01'),
    ('Charizard', 'rare', '2025-01-02')
''')

conn.commit()
conn.close()

print("Database initialized.")
