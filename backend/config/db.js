// Import mongoose library for MongoDB connection
const mongoose = require('mongoose');

let isConnected = false; // track connection status

// Function to connect to MongoDB database
const connectDB = async () => {
    // If already connected, return immediately
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        // Connect to MongoDB using the connection string from environment variables
        // MONGO_URI is stored in .env file for security
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internfinder';
        const conn = await mongoose.connect(mongoUri);

        isConnected = conn.connection.readyState === 1;
        // If connection is successful, display this message
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, display the error message
        console.error(`Error: ${error.message}`);
        // Exit the process if database connection fails (only in development)
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

// Export the function so it can be used in other files
module.exports = connectDB;


