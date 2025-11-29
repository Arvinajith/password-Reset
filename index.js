/**
 * Main server file for password reset application
 * Handles API endpoints for password reset flow
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passwordResetRoutes = require('./routes/passwordReset');
const userRoutes = require('./routes/user');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://localhost:3000'
].filter(Boolean); // Remove undefined values

// Log allowed origins for debugging
console.log('🌐 Allowed CORS origins:', allowedOrigins.length > 0 ? allowedOrigins : 'All origins (development mode)');

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const isDev = process.env.NODE_ENV !== 'production';

        // Allow Postman, mobile apps, or internal requests
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173'
        ].filter(Boolean);

        // Development: allow all
        if (isDev) return callback(null, true);

        // Production: allow only whitelisted
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`❌ CORS BLOCKED: ${origin}`);
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/passwordreset', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

