from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect("tcg-gacha.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/cards")
def get_cards():
    conn = get_db_connection()
    cards = conn.execute("SELECT * FROM cards").fetchall()
    conn.close()
    return jsonify([dict(card) for card in cards])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
