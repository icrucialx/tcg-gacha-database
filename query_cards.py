import sqlite3

def get_all_cards():
    conn = sqlite3.connect('tcg-gacha.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cards')
    cards = cursor.fetchall()
    conn.close()
    return cards

if __name__ == '__main__':
    cards = get_all_cards()
    for card in cards:
        print(card)
