const axios = require('axios');

const API_KEY = process.env.API_KEY || "892e335b";
const BASE_URL = "https://www.omdbapi.com/";

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req;
    console.log('[Vercel Function] Request:', req.method, url);

    try {
        // Health check
        if (url === '/api' || url === '/api/') {
            return res.status(200).json({ status: "Backend is running", key_configured: !!API_KEY });
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
