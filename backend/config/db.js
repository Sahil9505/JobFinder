const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // Return existing connection if available
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Return pending connection promise if exists
    if (cached.promise) {
        return cached.promise;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined');
    }

    const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    };

    // Create new connection promise
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
        .then((mongoose) => {
            console.log(`✓ MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        })
        .catch((error) => {
            cached.promise = null; // Reset on failure
            console.error('✗ MongoDB connection failed:', error.message);
            throw new Error(`Database connection failed: ${error.message}`);
        });

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;


