const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('=> using existing MongoDB connection');
        return;
    }

    try {
        constdb = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = db.connections[0].readyState;
        console.log("=> New MongoDB connection established");
    } catch (error) {
        console.error("MongoDB Connection error:", error);
        throw error;
    }
};

module.exports = connectDB;
