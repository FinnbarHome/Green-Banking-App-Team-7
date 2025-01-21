require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const helmet = require('helmet'); // Secure HTTP headers - disabled for AWS compatibility
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");
const discountsRoutes = require("./routes/discounts");
const transactionsRoutes = require("./routes/transactions");
const path = require("path");
const { setupWebSocket } = require("./websocket");

const app = express();

// Validate required environment variables
const requiredEnvVars = ["PORT", "MONGO_URI"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`ERROR: ${key} not specified in .env`);
    process.exit(1);
  }
});

// Middleware
// app.use(helmet()); // Secure HTTP headers - disabled for AWS compatibility
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON requests
app.use(compression()); // Compress response bodies
app.use(morgan("combined")); // Log HTTP requests

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 min window
  max: 250, // Max 250 requests per IP
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Establish DB connection and start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000; // Default port to 3000 if not set
    const server = app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}!`);
    });

    // Initialize WebSocket server
    setupWebSocket(server);
  })
  .catch((error) => {
    console.error("ERROR: Database connection failed", error);
    process.exit(1);
  });

// API routes
app.use("/api", apiRoutes); // Core API endpoints
app.use("/api", discountsRoutes); // Discounts endpoints
app.use("/api", transactionsRoutes); // Transactions endpoints

// Root endpoint (health check)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// SPA fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found" });
});

// Handle other uncaught errors
app.use((error, req, res, next) => {
  console.error("ERROR:", error.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Graceful shutdown
const gracefulShutdown = (signal, server) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });
};

module.exports = app; // Export for testing and reuse
