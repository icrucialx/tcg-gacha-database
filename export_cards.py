import sqlite3
import json

# Connect to the database
conn = sqlite3.connect("tcg-gacha.db")
cursor = conn.cursor()

# Query all cards
cursor.execute("SELECT card_name, rarity, date_of_pull FROM cards")
cards = cursor.fetchall()

# Convert to JSON
data = [{"card_name": c[0], "rarity": c[1], "date_of_pull": c[2]} for c in cards]
with open("cards.json", "w") as f:
    json.dump(data, f, indent=4)

conn.close()
print("Exported cards to cards.json")
