// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // Load environment variables from .env

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB()
    .then(() => {
        // Start the server after a successful database connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
    })
    .catch(error => {
        console.error("Database connection failed", error);
        process.exit(1); // Exit with failure if connection fails
    });

// Define API routes
app.use('/api', require('./routes/api'));
