const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('tcg-gacha.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create `pulls` table if it doesn't exist
db.run(
  `CREATE TABLE IF NOT EXISTS pulls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    date_of_pull TEXT NOT NULL
  )`,
  (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Ensured the "pulls" table exists.');
    }
  }
);

// Home route
app.get('/', (req, res) => {
  res.send('Hello World! Your app is running!');
});

// API endpoint to log a card pull
app.post('/pulls', (req, res) => {
  const { card_name, rarity } = req.body;

  if (!card_name || !rarity) {
    return res.status(400).json({ error: 'card_name and rarity are required' });
  }

  const date_of_pull = new Date().toISOString();

  const query = `INSERT INTO pulls (card_name, rarity, date_of_pull) VALUES (?, ?, ?)`;
  db.run(query, [card_name, rarity, date_of_pull], function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).json({ error: 'Failed to log pull' });
    }

    res.status(201).json({ status: 'success', id: this.lastID });
  });
});

// API endpoint to fetch all pulls (optional, for debugging)
app.get('/pulls', (req, res) => {
  const query = `SELECT * FROM pulls`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return res.status(500).json({ error: 'Failed to fetch pulls' });
    }

    res.json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
