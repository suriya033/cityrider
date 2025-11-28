const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoint
 * Use this to verify your backend is running and accessible
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'CityRider API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * API Info Endpoint
 * Provides information about available endpoints
 */
router.get('/info', (req, res) => {
    res.status(200).json({
        name: 'CityRider API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            rides: '/api/rides',
            bookings: '/api/bookings',
            users: '/api/users',
            messages: '/api/messages'
        },
        documentation: 'https://github.com/your-repo/cityrider'
    });
});

module.exports = router;
