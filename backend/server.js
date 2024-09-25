// Import dependencies
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // MongoDB connection function
const apiRoutes = require('./routes/api');
const serverless = require('serverless-http'); // For AWS Lambda compatibility
require('dotenv').config(); // Load environment variables from .env

const app = express();

// Middleware for JSON and CORS
app.use(express.json());
app.use(cors());

// Connect to MongoDB
let dbInitialized = false;

const initializeDB = async () => {
  if (!dbInitialized) {
    try {
      await connectDB(); // Connect to MongoDB if not already connected
      dbInitialized = true;
      console.log('Database connected');
    } catch (error) {
      console.error('ERROR: Database connection failed', error);
      process.exit(1); // Terminate process if DB connection fails
    }
  }
};

// Middleware to ensure DB is connected before handling any requests
app.use(async (req, res, next) => {
  await initializeDB(); // Ensure DB connection is initialized before proceeding
  next();
});

// API routes
app.use('/api', apiRoutes);

// 404 Error Handler for non-existent routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export the app for AWS Lambda
module.exports.handler = serverless(app); // Export the app as a Lambda-compatible handler
