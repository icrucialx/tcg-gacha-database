const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Twitch OAuth Configuration
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://icrucialx.github.io/icrucialtcg/';

// Middleware
app.use(cors({ origin: 'https://icrucialx.github.io' })); // Update origin as needed
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('tcg-gacha.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        process.exit(1); // Exit if database connection fails
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create `users` table
db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        login TEXT NOT NULL,
        display_name TEXT NOT NULL,
        profile_image_url TEXT
    )`,
    (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Ensured the "users" table exists.');
        }
    }
);

// Create `pulls` table
db.run(
    `CREATE TABLE IF NOT EXISTS pulls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        card_name TEXT NOT NULL,
        rarity TEXT NOT NULL,
        date_of_pull TEXT NOT NULL
    )`,
    (err) => {
        if (err) {
            console.error('Error creating pulls table:', err.message);
        } else {
            console.log('Ensured the "pulls" table exists with user_id.');
        }
    }
);

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('No authorization token provided');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const validationResponse = await axios.get('https://id.twitch.tv/oauth2/validate', {
            headers: { Authorization: `OAuth ${token}` },
        });

        console.log('Token validated:', validationResponse.data);
        next();
    } catch (error) {
        console.error('Token validation failed:', error.response?.data || error.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Public Routes
app.get('/', (req, res) => {
    res.send('Hello World! The Node.js backend is running!');
});

app.get('/login', (req, res) => {
    const scope = 'user:read:email';
    res.redirect(`https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`);
});

app.get('/auth/twitch/callback', async (req, res) => {
    const code = req.query.code; // Extract the code from the query parameters

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: TWITCH_CLIENT_ID,
                client_secret: TWITCH_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            },
        });

        const accessToken = tokenResponse.data.access_token;
        console.log("Access Token:", accessToken);

        // Fetch user information
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Client-ID': TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0];
        console.log("Twitch User Data:", userData);

        // Save user to the database
        db.run(
            `INSERT INTO users (id, login, display_name, profile_image_url) VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             login = excluded.login,
             display_name = excluded.display_name,
             profile_image_url = excluded.profile_image_url`,
            [userData.id, userData.login, userData.display_name, userData.profile_image_url],
            (err) => {
                if (err) {
                    console.error('Error saving user:', err.message);
                }
            }
        );

        // Redirect back to the frontend with the token and user ID
        res.redirect(`${REDIRECT_URI}?token=${accessToken}&user_id=${userData.id}`);
    } catch (error) {
        console.error('Error during OAuth callback:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to authenticate', details: error.response?.data || error.message });
    }
});


app.get('/health', (req, res) => {
    db.get('SELECT 1', [], (err) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Database connection failed' });
        }

        res.status(200).json({ status: 'healthy', message: 'Server is running and database is connected' });
    });
});

// Protected Routes
app.get('/collection/:user_id', authenticate, (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT DISTINCT card_name, rarity
        FROM pulls
        WHERE user_id = ?
        ORDER BY rarity DESC, card_name ASC
    `;

    db.all(query, [user_id], (err, rows) => {
        if (err) {
            console.error('Error fetching collection:', err.message);
            return res.status(500).json({ error: 'Failed to fetch collection' });
        }

        res.json(rows);
    });
});

app.post('/pulls', authenticate, (req, res) => {
    const { user_id, card_name, rarity } = req.body;

    if (!user_id || !card_name || !rarity) {
        return res.status(400).json({ error: 'user_id, card_name, and rarity are required' });
    }

    const date_of_pull = new Date().toISOString();
    const query = `INSERT INTO pulls (user_id, card_name, rarity, date_of_pull) VALUES (?, ?, ?, ?)`;

    db.run(query, [user_id, card_name, rarity, date_of_pull], function (err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: 'Failed to log pull' });
        }

        res.status(201).json({ status: 'success', id: this.lastID });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`OAuth Redirect URI: ${REDIRECT_URI}`);
});
