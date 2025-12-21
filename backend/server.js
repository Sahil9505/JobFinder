require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`❌ FATAL: Missing env vars: ${missingEnvVars.join(', ')}`);
    console.error('Available env vars:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASSWORD')).join(', '));
}

// Log startup info
console.log('🚀 Starting JobFinder API...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('🗄️  MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');

const app = express();

// CORS configuration - Allow Vercel preview deployments
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc)
        if (!origin) return callback(null, true);
        
        // Allow exact matches
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        // Allow any Vercel preview deployment URLs
        if (origin.includes('.vercel.app')) {
            console.log(`✓ CORS: Allowing Vercel origin: ${origin}`);
            return callback(null, true);
        }
        
        // Allow localhost during development
        if (origin.includes('localhost')) {
            console.log(`✓ CORS: Allowing localhost origin: ${origin}`);
            return callback(null, true);
        }
        
        console.log(`✗ CORS: Origin ${origin} not in allowed list`);
        return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Note: DB connection happens lazily in routes when needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3100;

// Import auth routes
const authRoutes = require('./routes/authRoutes');
// Use auth routes - all routes in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Import job routes
const jobRoutes = require('./routes/jobRoutes');
// Use job routes - all routes in jobRoutes will be prefixed with /api/jobs
app.use('/api/jobs', jobRoutes);

// Import application routes
const applicationRoutes = require('./routes/applicationRoutes');
// Use application routes - all routes in applicationRoutes will be prefixed with /api
app.use('/api', applicationRoutes);

// Import external jobs routes
const externalJobsRoutes = require('./routes/externalJobsRoutes');
// Use external jobs routes - all routes in externalJobsRoutes will be prefixed with /api/external-jobs
app.use('/api/external-jobs', externalJobsRoutes);

// Import companies routes
const companiesRoutes = require('./routes/companiesRoutes');
// Use companies routes - all routes in companiesRoutes will be prefixed with /api/companies
app.use('/api/companies', companiesRoutes);

// Health check endpoint - NO DB CONNECTION
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'JobFinder API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        env_check: {
            mongo_uri: !!process.env.MONGO_URI,
            jwt_secret: !!process.env.JWT_SECRET,
            frontend_url: !!process.env.FRONTEND_URL
        }
    });
});

// Database health check endpoint
app.get('/health', async (req, res) => {
    try {
        await connectDB();
        res.json({
            success: true,
            message: 'Database connected',
            mongodb: 'Connected ✓',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            mongo_uri_set: !!process.env.MONGO_URI
        });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
});

// Start server in local development only
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ CORS origins: ${allowedOrigins.join(', ')}`);
    });
}

// Export the Express app for Vercel serverless
module.exports = app;

