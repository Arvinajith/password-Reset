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

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // In production, check against allowed origins
        if (allowedOrigins.length === 0) {
            // If no FRONTEND_URL is set, allow all (not recommended for production)
            console.warn('⚠️  WARNING: No FRONTEND_URL set. Allowing all origins.');
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            // Support wildcard or exact match
            if (allowedOrigin === '*' || allowedOrigin === origin) {
                return true;
            }
            // Support subdomain matching
            if (origin.endsWith(allowedOrigin.replace(/^https?:\/\//, ''))) {
                return true;
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`❌ CORS blocked origin: ${origin}`);
            callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
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

