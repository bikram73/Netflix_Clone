const axios = require('axios');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const API_KEY = process.env.API_KEY || "892e335b";
const BASE_URL = "https://www.omdbapi.com/";

// Database Configuration - Parse connection string or use individual params
let poolConfig;
if (process.env.DATABASE_URL) {
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    poolConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        }
    };
}

const pool = new Pool(poolConfig);

// Initialize Database Table (runs once on cold start)
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        userid VARCHAR(255),
        username VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50)
    )
`).catch(err => console.error("Database initialization error:", err));

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url, method } = req;
    console.log('[Vercel Function] Request:', method, url);

    try {
        // Health check
        if (url === '/api' || url === '/api/') {
            return res.status(200).json({ status: "Backend is running", key_configured: !!API_KEY });
        }

        // Sign Up Endpoint
        if (url.startsWith('/api/signup') && method === 'POST') {
            const { userid, username, password, email, phone } = req.body;
            
            try {
                // Check if user exists
                const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                if (userCheck.rows.length > 0) {
                    return res.status(400).json({ error: "User already exists with this email." });
                }

                // Encrypt password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Insert into DB
                const newUser = await pool.query(
                    "INSERT INTO users (userid, username, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                    [userid, username, email, hashedPassword, phone]
                );

                return res.status(200).json({ message: "User created successfully", user: newUser.rows[0] });
            } catch (err) {
                console.error('[Signup Error]', err);
                return res.status(500).json({ error: "Server error during signup" });
            }
        }

        // Sign In Endpoint
        if (url.startsWith('/api/login') && method === 'POST') {
            const { email, password } = req.body;
            
            try {
                // Find user
                const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                if (userResult.rows.length === 0) {
                    return res.status(400).json({ error: "Invalid email or password" });
                }

                const user = userResult.rows[0];

                // Compare password
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(400).json({ error: "Invalid email or password" });
                }

                // Login successful
                return res.status(200).json({ 
                    message: "Login successful", 
                    user: { id: user.id, username: user.username, email: user.email } 
                });
            } catch (err) {
                console.error('[Login Error]', err);
                return res.status(500).json({ error: "Server error during login" });
            }
        }

        // Search endpoint
        if (url.startsWith('/api/search')) {
            const urlParams = new URL(url, `https://${req.headers.host}`);
            const query = urlParams.searchParams.get('q');
            
            if (!query) {
                return res.status(400).json({ error: "Missing query parameter 'q'" });
            }

            const response = await axios.get(BASE_URL, {
                params: {
                    s: query,
                    apikey: API_KEY
                }
            });
            return res.status(200).json(response.data);
        }

        // Movie details endpoint
        if (url.startsWith('/api/movie/')) {
            const id = url.split('/api/movie/')[1].split('?')[0];
            
            if (!id) {
                return res.status(400).json({ error: "Missing movie ID" });
            }

            const response = await axios.get(BASE_URL, {
                params: {
                    i: id,
                    apikey: API_KEY
                }
            });
            return res.status(200).json(response.data);
        }

        // 404 for unknown routes
        return res.status(404).json({ error: "Endpoint not found", path: url });

    } catch (error) {
        console.error('[Vercel Function] Error:', error.message);
        return res.status(500).json({ 
            error: "Internal Server Error", 
            details: error.message 
        });
    }
};
