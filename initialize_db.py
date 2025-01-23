import sqlite3

# Connect to the SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect("tcg-gacha.db")

# Create a cursor object to execute SQL commands
cursor = conn.cursor()

# Create the cards table if it does not exist
cursor.execute('''
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    date_of_pull TEXT NOT NULL
)
''')

# Optionally insert sample data for testing
cursor.execute('''
INSERT INTO cards (card_name, rarity, date_of_pull)
VALUES
    ('Pikachu', 'common', '2025-01-01'),
    ('Charizard', 'rare', '2025-01-02')
''')

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Database initialized and 'cards' table created.")
