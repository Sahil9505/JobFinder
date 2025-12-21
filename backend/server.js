const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}. Configure them in Vercel dashboard.`);
}

const app = express();

// Strict CORS configuration for production
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Lazy database connection middleware for serverless
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB connection failed:', error);
        return res.status(503).json({ 
            success: false,
            message: 'Service temporarily unavailable - database connection failed',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
});

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

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'JobFinder API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
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

