const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to the database");

        // Handle connection loss and reconnection
        mongoose.connection.on('disconnected', () => {
            console.error("MongoDB disconnected. Attempting to reconnect...");
            connectDB();
        });
    } catch (error) {
        console.error("ERROR: MongoDB connection failed:", error.message);
        process.exit(1); // Terminate the process if the connection fails
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination.");
    process.exit(0);
});

module.exports = connectDB;
