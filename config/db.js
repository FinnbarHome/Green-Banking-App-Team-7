const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);

        // Only log when not in the test env
        if (process.env.NODE_ENV !== 'test') {
            console.log("Connected to the database");
        }

        // Handle connection loss and reconnection, only if not in a test env
        if (process.env.NODE_ENV !== 'test') {
            mongoose.connection.on('disconnected', () => {
                console.error("MongoDB disconnected. Attempting to reconnect...");
                // Only attempt reconnection outside of tests
                connectDB();  
            });
        }
    } catch (error) {
        console.error("ERROR: MongoDB connection failed:", error.message);
        // Terminate the process if the connection fails
        process.exit(1);  
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to app termination.");
    process.exit(0);
});

module.exports = connectDB;
