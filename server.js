require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const setupMiddleware = require("./middleware");
const setupRoutes = require("./routes");
const { setupWebSocket } = require("./websocket");

const app = express();

// Validate environment variables
const validateEnvVars = () => {
  const requiredEnvVars = ["PORT", "MONGO_URI"];
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    console.error(
      `ERROR: Missing environment variables: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }
};

// Initialize app
const startServer = async () => {
  validateEnvVars();
  try {
    await connectDB(); // Establish DB connection
    console.log("Database connected successfully");

    setupMiddleware(app); // Configure middleware
    setupRoutes(app); // Set up routes

    const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT not set
    const server = app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });

    setupWebSocket(server); // Initialize WebSocket server

    // Graceful shutdown setup
    process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
  } catch (error) {
    console.error("ERROR: Server initialization failed", error);
    process.exit(1);
  }
};

// Graceful shutdown function
const gracefulShutdown = (signal, server) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("Closed remaining connections");
    // Add DB disconnection logic if needed
    process.exit(0);
  });
};

// Start the server
startServer();

module.exports = app; // Export for testing
