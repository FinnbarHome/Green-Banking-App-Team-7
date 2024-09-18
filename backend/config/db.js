const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        await mongoose.connect(uri); // No options needed for newer MongoDB drivers
        console.log("Connected to the database");
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
