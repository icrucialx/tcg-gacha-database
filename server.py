from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('tcg-gacha.db')
    conn.row_factory = sqlite3.Row
    return conn

# API endpoint to log a card pull
@app.route('/pulls', methods=['POST'])
def log_pull():
    data = request.get_json()
    print("Received data:", data)
    card_name = data['card_name']
    rarity = data['rarity']
    date_of_pull = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO pulls (card_name, rarity, date_of_pull) VALUES (?, ?, ?)',
        (card_name, rarity, date_of_pull)
    )
    conn.commit()
    conn.close()

    return jsonify({'status': 'success'}), 201

if __name__ == '__main__':
    app.run(debug=True)
