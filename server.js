require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = "892e335b";
const BASE_URL = "https://www.omdbapi.com/";

// --- Database Configuration (Aiven) ---
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize Database Table
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        userid VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(10) NOT NULL
    )
`).then(() => console.log("Table 'users' is ready"))
  .catch(err => console.error("Database initialization error:", err));

app.use(cors());
app.use(express.json());

// Debug logging to check if requests reach the server
app.use((req, res, next) => {
    console.log(`[Server] Request received: ${req.method} ${req.url}`);
    next();
});

// --- Authentication Routes ---

// Sign Up Endpoint
app.post(['/api/signup', '/signup'], async (req, res) => {
    const { username, password, email, phone } = req.body;
    
    try {
        // Validate required fields
        if (!username || !email || !password || !phone) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Validate password length (minimum 10 characters)
        if (password.length < 10) {
            return res.status(400).json({ error: "Password must be at least 10 characters long" });
        }
        
        // Validate phone number (exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
        }
        
        // Check if email already exists
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        // Generate unique userid (timestamp + random string)
        const userid = 'USER' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into DB
        const newUser = await pool.query(
            "INSERT INTO users (userid, username, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING userid, username, email, phone",
            [userid, username, email, hashedPassword, phone]
        );

        res.json({ 
            message: "User created successfully", 
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during signup" });
    }
});

// Sign In Endpoint
app.post(['/api/login', '/login'], async (req, res) => {
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
        res.json({ 
            message: "Login successful", 
            user: { 
                userid: user.userid, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Health Check Endpoint
app.get('/api', (req, res) => {
    res.json({ status: "Backend is running", key_configured: true });
});

app.get('/', (req, res) => {
    res.json({ status: "Backend is running", key_configured: true });
});

// Proxy endpoint to search movies
app.get(['/api/search', '/search'], async (req, res) => {
    const { q } = req.query;
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                s: q,
                apikey: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Proxy endpoint to get movie details
app.get(['/api/movie/:id', '/movie/:id'], async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                i: id,
                apikey: API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// --- Error Handling & 404 ---

// Global Error Handler (prevents 500 HTML responses)
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Catch-all 404 Handler (prevents 404 HTML responses)
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found", path: req.url });
});

// Only run the server if this file is run directly (not imported by Vercel)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;