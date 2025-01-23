from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('tcg-gacha.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/cards', methods=['GET'])
def get_cards():
    conn = get_db_connection()
    cards = conn.execute('SELECT * FROM cards').fetchall()
    conn.close()
    return jsonify([dict(card) for card in cards])

@app.route('/pulls', methods=['POST'])
def add_pull():
    new_pull = request.get_json()
    card_name = new_pull['card_name']
    rarity = new_pull['rarity']
    date_of_pull = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conn = get_db_connection()
    conn.execute('INSERT INTO pulls (card_name, rarity, date_of_pull) VALUES (?, ?, ?)',
                 (card_name, rarity, date_of_pull))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'}), 201

if __name__ == '__main__':
    app.run(debug=True)
