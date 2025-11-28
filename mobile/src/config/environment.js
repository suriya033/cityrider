// Environment Configuration
// This file helps manage different environments (development, production)
// Check if we're in development mode
export const IS_DEV = __DEV__;

// Backend API Configuration
export const API_CONFIG = {
    // Development: Local backend (for testing on same WiFi)
    development: {
        baseURL: 'http://10.219.31.35:5004/api',
        timeout: 10000,
    },
    // Production: Deployed backend on Render (works from anywhere!)
    production: {
        baseURL: 'https://cityrider-backend.onrender.com/api',
        timeout: 15000,
    },
};

// Get current environment config
export const getCurrentConfig = () => {
    return IS_DEV ? API_CONFIG.development : API_CONFIG.production;
};
export const FEATURES = {
    // Enable offline mode (use cached data when backend is unreachable)
    offlineMode: true,

    // Enable detailed logging
    detailedLogging: IS_DEV,

    // Enable error reporting
    errorReporting: !IS_DEV,
};

// App Configuration
export const APP_CONFIG = {
    name: 'CityRider',
    version: '2.0.0',

    // Retry configuration for failed requests
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
    },

    // Cache configuration
    cache: {
        userDataKey: 'userData',
        tokenKey: 'userToken',
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
};

export default {
    IS_DEV,
    API_CONFIG,
    getCurrentConfig,
    FEATURES,
    APP_CONFIG,
};
