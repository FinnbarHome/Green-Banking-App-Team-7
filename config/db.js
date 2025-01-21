const mongoose = require("mongoose");

// Establish MongoDB connection
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("ERROR: MONGO_URI is not defined.");
    process.exit(1); // Exit if MONGO_URI is missing
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("ERROR: MongoDB connection failed:", error.message);
    process.exit(1); // Exit if initial connection fails
  }
};

// Handle MongoDB events (disconnection/reconnection)
const setupDBEventHandlers = () => {
  mongoose.connection.on("disconnected", async () => {
    console.error("MongoDB disconnected. Reconnecting...");
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Reconnected to MongoDB.");
    } catch (error) {
      console.error("ERROR: Reconnection failed:", error.message);
    }
  });
};

// Graceful shutdown for SIGINT
const handleGracefulShutdown = () => {
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (error) {
      console.error(
        "ERROR: Failed to close MongoDB connection:",
        error.message
      );
    } finally {
      process.exit(0); // Exit after cleanup
    }
  });
};

// Initialize MongoDB handlers
setupDBEventHandlers();
handleGracefulShutdown();

module.exports = connectDB;
