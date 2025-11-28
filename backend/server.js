const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cityrider';

// Connection options with better timeout and retry settings
const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Socket timeout
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    w: 'majority'
};

// Connect to MongoDB with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('✅ MongoDB Connected successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000); // Retry after 5 seconds
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

// Initial connection
connectDB();

// Import Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api', healthRoutes); // Health routes at /api/health and /api/info

// Basic route
app.get('/', (req, res) => {
    res.send('CityRider Backend is running');
});

// Start server - LISTEN ON ALL NETWORK INTERFACES
const PORT = process.env.PORT || 5004;
const HOST = '0.0.0.0'; // This allows connections from network devices

// Get local IP address for logging
const { networkInterfaces } = require('os');
const getLocalIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
};

server.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Mobile devices can connect at: http://${localIP}:${PORT}/api`);
    console.log(`💻 Local access: http://localhost:${PORT}/api`);
});

module.exports = { app, io };